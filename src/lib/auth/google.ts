import 'server-only'

import crypto from 'node:crypto'

// Google sign-in: OAuth 2.0 authorization-code flow with state and PKCE.
export const OAUTH_COOKIE = 'hsn_oauth'

export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const b64url = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function newPkce() {
  const verifier = b64url(crypto.randomBytes(32))
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
  const state = b64url(crypto.randomBytes(24))
  return { verifier, challenge, state }
}

// Public origin for the redirect URI. Set SITE_URL in production (e.g. https://www.example.org).
export function siteOrigin(requestUrl: string) {
  return (process.env.SITE_URL || new URL(requestUrl).origin).replace(/\/$/, '')
}

export const redirectUri = (requestUrl: string) => `${siteOrigin(requestUrl)}/api/auth/google/callback`

export function authorizeUrl(requestUrl: string, state: string, challenge: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri(requestUrl),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export type GoogleProfile = { sub: string; email: string; emailVerified: boolean; name: string }

// Exchanges the code for tokens. The ID token comes straight from Google's token endpoint over TLS,
// so its claims can be read without checking the signature (OpenID Connect Core 3.1.3.7); we still check iss/aud/exp.
export async function exchangeCode(requestUrl: string, code: string, verifier: string): Promise<GoogleProfile> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri(requestUrl),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`)
  const { id_token } = (await res.json()) as { id_token?: string }
  if (!id_token) throw new Error('Google returned no ID token')
  const claims = JSON.parse(Buffer.from(id_token.split('.')[1] || '', 'base64url').toString('utf8'))
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) throw new Error('Bad issuer')
  if (claims.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error('Bad audience')
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) throw new Error('Expired ID token')
  return {
    sub: String(claims.sub),
    email: String(claims.email || '').toLowerCase(),
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
    name: String(claims.name || claims.email || ''),
  }
}
