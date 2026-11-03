import 'server-only'

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { isEmail, normalizeEmail } from '@/lib/auth/codes'
import { getPayloadClient } from '@/lib/payload'
import { secretKey } from '@/lib/secret'

// Admin panel sign-in: admin email + password (Payload `users`, which also lock after repeated wrong
// passwords). The HSN account is created/updated from .env by scripts/create-admin.ts.
const COOKIE = 'hsn_admin'
const MAX_AGE = 60 * 60 * 12 // 12 hours
const key = () => secretKey('admin')
const AUDIENCE = 'hsn-admin'

export type Admin = { id: string | number; email: string; name: string; initial: string }

export async function loginAdmin(rawEmail: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail)
  if (!isEmail(email) || !password) return { ok: false, error: 'Enter your admin email and password.' }
  const payload = await getPayloadClient()
  let userId: string | number
  let version = 0
  try {
    const res = await payload.login({ collection: 'users', data: { email, password } })
    if (!res.user) throw new Error('no user')
    userId = res.user.id
    version = (res.user as { sessionVersion?: number | null }).sessionVersion ?? 0
  } catch (e) {
    const locked = e instanceof Error && /locked/i.test(e.message)
    return {
      ok: false,
      error: locked ? 'Too many wrong passwords. This account is locked for 10 minutes.' : 'That email and password don’t match an HSN admin account.',
    }
  }
  const token = await new SignJWT({ sub: String(userId), v: version })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key())
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
  return { ok: true }
}

// Logs out: ends every session of this admin (all devices), then clears the cookie.
export async function clearAdminCookie() {
  const admin = await getAdmin()
  if (admin) {
    const payload = await getPayloadClient()
    const user = await payload.findByID({ collection: 'users', id: admin.id, depth: 0 }).catch(() => null)
    if (user) await payload.update({ collection: 'users', id: user.id, data: { sessionVersion: (user.sessionVersion ?? 0) + 1 } })
  }
  const jar = await cookies()
  jar.delete(COOKIE)
}

export const getAdmin = cache(async (): Promise<Admin | null> => {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload: claims } = await jwtVerify(token, key(), { algorithms: ['HS256'], audience: AUDIENCE })
    if (!claims.sub) return null
    const payload = await getPayloadClient()
    const user = await payload.findByID({ collection: 'users', id: claims.sub, depth: 0 }).catch(() => null)
    if (!user || (claims.v ?? 0) !== (user.sessionVersion ?? 0)) return null
    const name = user.name || user.email
    return { id: user.id, email: user.email, name, initial: name.trim()[0]?.toUpperCase() || 'A' }
  } catch {
    return null
  }
})

export async function requireAdmin(nextPath = '/admin'): Promise<Admin> {
  const admin = await getAdmin()
  if (!admin) redirect(`/login?admin=1&next=${encodeURIComponent(nextPath)}`)
  return admin
}
