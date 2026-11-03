import 'server-only'

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { getPayloadClient } from '@/lib/payload'
import { secretKey } from '@/lib/secret'

// Member sessions: a signed, httpOnly cookie holding the member id. Admins use Payload's own login at /admin.
export const SESSION_COOKIE = 'hsn_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const key = () => secretKey('member')
const AUDIENCE = 'hsn-member'

// The token carries the member's session version; logging out bumps it, which ends every session at once.
export async function createSessionToken(memberId: string | number) {
  const payload = await getPayloadClient()
  const m = await payload.findByID({ collection: 'members', id: memberId, depth: 0 })
  return new SignJWT({ sub: String(memberId), v: m.sessionVersion ?? 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key())
}

export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
})

export async function setSessionCookie(memberId: string | number) {
  const token = await createSessionToken(memberId)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, sessionCookieOptions())
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

// Ends all of this member's sessions (every device).
export async function revokeMemberSessions(memberId: string | number) {
  const payload = await getPayloadClient()
  const m = await payload.findByID({ collection: 'members', id: memberId, depth: 0 }).catch(() => null)
  if (m) await payload.update({ collection: 'members', id: m.id, data: { sessionVersion: (m.sessionVersion ?? 0) + 1 } })
}

export type CurrentMember = {
  id: string | number
  name: string
  email: string
  initials: string
  membershipType: string | null
  membershipTier: string | null
  membershipStatus: string | null
}

const TIER_LABEL: Record<string, string> = {
  student: 'Student',
  individual: 'Individual Professional',
  institutional: 'Institutional',
}

export const initialsOf = (name: string) =>
  name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('') || '?'

// The signed-in member for this request, or null. Cached per request.
export const getCurrentMember = cache(async (): Promise<CurrentMember | null> => {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload: claims } = await jwtVerify(token, key(), { algorithms: ['HS256'], audience: AUDIENCE })
    if (!claims.sub) return null
    const payload = await getPayloadClient()
    const m = await payload.findByID({ collection: 'members', id: claims.sub, depth: 0 }).catch(() => null)
    if (!m || m.blocked || (claims.v ?? 0) !== (m.sessionVersion ?? 0)) return null
    const active = m.membershipStatus === 'active'
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      initials: initialsOf(m.name),
      membershipTier: m.membershipTier ?? null,
      membershipStatus: m.membershipStatus ?? null,
      membershipType: active && m.membershipTier ? TIER_LABEL[m.membershipTier] ?? null : null,
    }
  } catch {
    return null
  }
})
