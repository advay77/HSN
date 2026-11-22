import { NextResponse, type NextRequest } from 'next/server'

import { authorizeUrl, googleConfigured, newPkce, OAUTH_COOKIE } from '@/lib/auth/google'
import { safeNext } from '@/lib/auth/redirect'
import { rateLimit } from '@/lib/rate-limit'

// Starts Google sign-in: remembers state, PKCE verifier and ?next= in a short-lived cookie, then sends the user to Google.
export async function GET(req: NextRequest) {
  if (!(await rateLimit('google-login', 20, 15 * 60))) {
    return NextResponse.redirect(new URL('/login?error=too-many', req.url))
  }
  const next = safeNext(req.nextUrl.searchParams.get('next'))
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL(`/login?error=google-not-configured&next=${encodeURIComponent(next)}`, req.url))
  }
  const { verifier, challenge, state } = newPkce()
  const res = NextResponse.redirect(authorizeUrl(req.url, state, challenge))
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/google',
    maxAge: 600,
  })
  return res
}
