import 'server-only'

import crypto from 'node:crypto'

import { and, eq } from '@/lib/db'
import { getPayloadClient } from '@/lib/payload'
import { serverSecret } from '@/lib/secret'
import { sendLoginCode } from './mail'

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_AFTER_MS = 60 * 1000
const MAX_REQUESTS_PER_HOUR = 5

export type CodeScope = 'member' | 'admin'

export const normalizeEmail = (email: string) => email.trim().toLowerCase()
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const hashCode = (scope: CodeScope, email: string, code: string) =>
  crypto
    .createHmac('sha256', serverSecret())
    .update(`${scope === 'admin' ? 'admin:' : ''}${email}:${code}`)
    .digest('hex')

const scopeWhere = (scope: CodeScope) =>
  scope === 'admin' ? { scope: { equals: 'admin' } } : { scope: { not_equals: 'admin' } }

export type RequestCodeResult =
  | { ok: true; resendIn: number }
  | { ok: false; error: string; resendIn?: number }

/** Creates and emails a 6-digit code (rate-limited per email: one a minute, five an hour). */
export async function issueCode(
  rawEmail: string,
  scope: CodeScope,
  extra: { name?: string; joinNetwork?: boolean } = {},
): Promise<RequestCodeResult> {
  const email = normalizeEmail(rawEmail)
  const payload = await getPayloadClient()
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recent = await payload.find({
    collection: 'login-codes',
    where: { and: [{ email: { equals: email } }, scopeWhere(scope), { createdAt: { greater_than: hourAgo } }] },
    sort: '-createdAt',
    limit: MAX_REQUESTS_PER_HOUR,
    depth: 0,
  })
  const last = recent.docs[0]
  if (last) {
    const wait = RESEND_AFTER_MS - (Date.now() - new Date(last.createdAt).getTime())
    if (wait > 0) return { ok: false, error: 'A code was just sent. Please wait before asking for another.', resendIn: Math.ceil(wait / 1000) }
  }
  if (recent.totalDocs >= MAX_REQUESTS_PER_HOUR) {
    return { ok: false, error: 'Too many codes requested for this email. Please try again in an hour.' }
  }

  // Only the newest code works.
  await payload.update({
    collection: 'login-codes',
    where: { and: [{ email: { equals: email } }, scopeWhere(scope), { used: { equals: false } }] },
    data: { used: true },
  })

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  const created = await payload.create({
    collection: 'login-codes',
    data: {
      email,
      scope,
      codeHash: hashCode(scope, email, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      attempts: 0,
      used: false,
      name: extra.name,
      joinNetwork: !!extra.joinNetwork,
    },
  })
  try {
    await sendLoginCode(email, code)
  } catch (err) {
    await payload.delete({ collection: 'login-codes', id: created.id })
    payload.logger.error({ err }, 'Could not send log-in code')
    return { ok: false, error: 'We couldn’t send the email just now. Please try again in a few minutes.' }
  }
  return { ok: true, resendIn: RESEND_AFTER_MS / 1000 }
}

/** Checks a code. On success the code is used up and its sign-up details are returned. */
export async function consumeCode(
  rawEmail: string,
  rawCode: string,
  scope: CodeScope,
): Promise<{ ok: true; email: string; name?: string | null; joinNetwork?: boolean | null } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail)
  const code = rawCode.replace(/\D/g, '')
  if (code.length !== 6) return { ok: false, error: 'Enter the 6-digit code from the email.' }
  const payload = await getPayloadClient()

  const found = await payload.find({
    collection: 'login-codes',
    where: { and: [{ email: { equals: email } }, scopeWhere(scope), { used: { equals: false } }] },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
  })
  const entry = found.docs[0]
  if (!entry || new Date(entry.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: 'This code has expired. Ask for a new one.' }
  }
  if ((entry.attempts ?? 0) >= MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many wrong tries. Ask for a new code.' }
  }
  // Claim this guess first with a compare-and-swap on the attempt counter. If another request changed it in
  // the meantime the guess is refused, so a burst of parallel guesses still gets at most MAX_ATTEMPTS tries.
  const before = entry.attempts ?? 0
  const attempts = before + 1
  const t = payload.db.tables['login_codes']
  const claimed = await payload.db.drizzle
    .update(t)
    .set({ attempts, used: attempts >= MAX_ATTEMPTS })
    .where(and(eq(t.id, entry.id), eq(t.attempts, before), eq(t.used, false)))
    .returning({ id: t.id })
  if (claimed.length !== 1) return { ok: false, error: 'That code is not right. Check the email and try again.' }
  const expected = Buffer.from(entry.codeHash, 'hex')
  const given = Buffer.from(hashCode(scope, email, code), 'hex')
  const match = expected.length === given.length && crypto.timingSafeEqual(expected, given)
  if (!match) {
    return {
      ok: false,
      error: attempts >= MAX_ATTEMPTS ? 'Too many wrong tries. Ask for a new code.' : 'That code is not right. Check the email and try again.',
    }
  }
  // Codes have done their job; remove this email's old codes for this scope.
  await payload.delete({ collection: 'login-codes', where: { and: [{ email: { equals: email } }, scopeWhere(scope)] } })
  return { ok: true, email, name: entry.name, joinNetwork: entry.joinNetwork }
}

export async function requestLoginCode(input: {
  email: string
  mode: 'login' | 'signup'
  name?: string
  joinNetwork?: boolean
}): Promise<RequestCodeResult> {
  const email = normalizeEmail(input.email)
  if (!isEmail(email)) return { ok: false, error: 'Enter a valid email address.' }
  const payload = await getPayloadClient()

  const existing = await payload.find({ collection: 'members', where: { email: { equals: email } }, limit: 1, depth: 0 })
  const member = existing.docs[0]
  if (input.mode === 'login' && !member) {
    return { ok: false, error: 'We couldn’t find an account with this email. Choose Sign up to create one.' }
  }
  const name = input.name?.trim() || ''
  if (input.mode === 'signup' && !member && !name) return { ok: false, error: 'Enter your full name.' }
  return issueCode(email, 'member', { name: member ? undefined : name, joinNetwork: input.joinNetwork })
}

export type VerifyCodeResult = { ok: true; memberId: number | string } | { ok: false; error: string }

export async function verifyLoginCode(rawEmail: string, rawCode: string): Promise<VerifyCodeResult> {
  const result = await consumeCode(rawEmail, rawCode, 'member')
  if (!result.ok) return result
  const { email } = result
  const payload = await getPayloadClient()

  const existing = await payload.find({ collection: 'members', where: { email: { equals: email } }, limit: 1, depth: 0 })
  const now = new Date().toISOString()
  let member = existing.docs[0]
  if (member?.blocked) return { ok: false, error: 'This account has been blocked. Contact HSN if you think this is a mistake.' }
  if (member) {
    member = await payload.update({ collection: 'members', id: member.id, data: { lastLoginAt: now, lastLoginMethod: 'email' } })
  } else {
    if (!result.name) return { ok: false, error: 'Please sign up first.' }
    member = await payload.create({
      collection: 'members',
      data: { name: result.name, email, authProvider: 'email', joinNetwork: !!result.joinNetwork, lastLoginAt: now, lastLoginMethod: 'email', membershipStatus: 'none' },
    })
  }
  return { ok: true, memberId: member.id }
}
