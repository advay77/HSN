import { NextResponse, type NextRequest } from 'next/server'

import { exchangeCode, OAUTH_COOKIE } from '@/lib/auth/google'
import { safeNext } from '@/lib/auth/redirect'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'

// Google sends the user back here. Checks state, swaps the code for the profile, then finds or creates the member
// (linked by Google id, or by verified email for someone who first signed up with an email code).
export async function GET(req: NextRequest) {
  const fail = (reason: string, next = '/my') => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}&next=${encodeURIComponent(next)}`, req.url))
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth/google' })
    return res
  }

  let saved: { state?: string; verifier?: string; next?: string } = {}
  try {
    saved = JSON.parse(req.cookies.get(OAUTH_COOKIE)?.value || '{}')
  } catch {}
  const next = safeNext(saved.next)
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  if (req.nextUrl.searchParams.get('error')) return fail('google-cancelled', next)
  if (!code || !state || !saved.state || state !== saved.state || !saved.verifier) return fail('google', next)

  try {
    const profile = await exchangeCode(req.url, code, saved.verifier)
    if (!profile.email || !profile.emailVerified) return fail('google-email', next)

    const payload = await getPayloadClient()
    const now = new Date().toISOString()
    const byGoogle = await payload.find({ collection: 'members', where: { googleId: { equals: profile.sub } }, limit: 1, depth: 0 })
    let member = byGoogle.docs[0]
    if (!member) {
      const byEmail = await payload.find({ collection: 'members', where: { email: { equals: profile.email } }, limit: 1, depth: 0 })
      member = byEmail.docs[0]
    }
    if (member?.blocked) return NextResponse.redirect(new URL('/login?error=blocked', req.url))
    if (member) {
      member = await payload.update({ collection: 'members', id: member.id, data: { googleId: profile.sub, lastLoginAt: now, lastLoginMethod: 'google' } })
    } else {
      member = await payload.create({
        collection: 'members',
        data: { name: profile.name || profile.email, email: profile.email, googleId: profile.sub, authProvider: 'google', lastLoginAt: now, lastLoginMethod: 'google', membershipStatus: 'none' },
      })
    }
    const res = NextResponse.redirect(new URL(next, req.url))
    res.cookies.set(SESSION_COOKIE, await createSessionToken(member.id), sessionCookieOptions())
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth/google' })
    return res
  } catch (err) {
    console.error('[auth] Google sign-in failed', err)
    return fail('google', next)
  }
}
