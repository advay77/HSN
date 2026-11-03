'use server'

import { loginAdmin } from '@/lib/admin/auth'
import { requestLoginCode, verifyLoginCode } from '@/lib/auth/codes'
import { safeNext } from '@/lib/auth/redirect'
import { setSessionCookie } from '@/lib/auth/session'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'
import { TURNSTILE_FAILED, verifyTurnstile } from '@/lib/turnstile'

export async function sendCodeAction(input: { email: string; mode: 'login' | 'signup'; name?: string; joinNetwork?: boolean; turnstile?: string }) {
  if (!(await rateLimit('send-code', 10, 60 * 60))) return { ok: false as const, error: TOO_MANY }
  if (!(await verifyTurnstile(input.turnstile))) return { ok: false as const, error: TURNSTILE_FAILED }
  return requestLoginCode({
    email: String(input.email || ''),
    mode: input.mode === 'signup' ? 'signup' : 'login',
    name: input.name ? String(input.name) : undefined,
    joinNetwork: !!input.joinNetwork,
  })
}

export async function verifyCodeAction(input: { email: string; code: string; next?: string }) {
  if (!(await rateLimit('verify-code', 20, 10 * 60))) return { ok: false as const, error: TOO_MANY }
  const result = await verifyLoginCode(String(input.email || ''), String(input.code || ''))
  if (!result.ok) return result
  await setSessionCookie(result.memberId)
  return { ok: true as const, next: safeNext(input.next) }
}

export async function adminLoginAction(input: { email: string; password: string; next?: string; turnstile?: string }) {
  if (!(await rateLimit('admin-login', 10, 15 * 60))) return { ok: false as const, error: TOO_MANY }
  if (!(await verifyTurnstile(input.turnstile))) return { ok: false as const, error: TURNSTILE_FAILED }
  const result = await loginAdmin(String(input.email || ''), String(input.password || ''))
  if (!result.ok) return result
  const next = safeNext(input.next)
  return { ok: true as const, next: next.startsWith('/admin') ? next : '/admin' }
}
