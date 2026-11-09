'use server'

import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'
import { TURNSTILE_FAILED, verifyTurnstile } from '@/lib/turnstile'

export type SiteFeedbackState = { ok: boolean; error?: string }

const RATINGS = ['5', '4', '3', '2', '1'] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Website feedback form (Home, About, /feedback). Saved for the admin panel's Feedback page. */
export async function submitSiteFeedback(_prev: SiteFeedbackState, form: FormData): Promise<SiteFeedbackState> {
  // A hidden field people never see; bots that fill it are ignored quietly.
  if (String(form.get('website') || '')) return { ok: true }
  if (!(await rateLimit('site-feedback', 5, 60 * 60))) return { ok: false, error: TOO_MANY }
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { ok: false, error: TURNSTILE_FAILED }

  const message = String(form.get('message') || '').trim().slice(0, 4000)
  if (message.length < 3) return { ok: false, error: 'Please write your feedback.' }
  const name = String(form.get('name') || '').trim().slice(0, 200)
  const email = String(form.get('email') || '').trim().slice(0, 200)
  if (email && !EMAIL.test(email)) return { ok: false, error: 'Check the email address, or leave it empty.' }
  const ratingRaw = String(form.get('rating') || '')
  const rating = (RATINGS as readonly string[]).includes(ratingRaw) ? (ratingRaw as (typeof RATINGS)[number]) : undefined
  const page = String(form.get('page') || '').slice(0, 200)

  const member = await getCurrentMember()
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'site-feedback',
    data: {
      name: name || member?.name || undefined,
      email: email || member?.email || undefined,
      rating,
      message,
      page: page.startsWith('/') ? page : undefined,
      member: member ? Number(member.id) : undefined,
      read: false,
    },
  })
  return { ok: true }
}
