import 'server-only'

import { clientIp } from '@/lib/rate-limit'

// Cloudflare Turnstile: checks that a form was sent by a person, not a bot. Switched on by
// NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY; without them every form works as before.
export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export const TURNSTILE_FAILED = 'Please complete the security check and try again.'

export async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (!turnstileEnabled()) return true
  if (typeof token !== 'string' || !token || token.length > 2048) return false
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: await clientIp() })
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, cache: 'no-store', signal: AbortSignal.timeout(8000) })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
