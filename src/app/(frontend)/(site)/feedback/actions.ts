'use server'

import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'
import { ASPECTS, ROLES, SOURCES, WANTS } from '@/lib/siteFeedback'
import { TURNSTILE_FAILED, verifyTurnstile } from '@/lib/turnstile'

export type SiteFeedbackState = { ok: boolean; error?: string; field?: string }

const RATINGS = ['5', '4', '3', '2', '1'] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const text = (form: FormData, key: string, max = 4000) => String(form.get(key) || '').trim().slice(0, max)

/** Website feedback form (/feedback). Saved for the admin panel's Feedback page. */
export async function submitSiteFeedback(_prev: SiteFeedbackState, form: FormData): Promise<SiteFeedbackState> {
  // A hidden field people never see; bots that fill it are ignored quietly.
  if (text(form, 'website')) return { ok: true }

  const ratingRaw = text(form, 'rating', 2)
  if (!(RATINGS as readonly string[]).includes(ratingRaw)) return { ok: false, field: 'rating', error: 'Please give an overall star rating.' }
  const rating = ratingRaw as (typeof RATINGS)[number]
  const message = text(form, 'message')
  if (message.length < 3) return { ok: false, field: 'message', error: 'Please tell us what we could improve.' }
  const email = text(form, 'email', 200)
  if (email && !EMAIL.test(email)) return { ok: false, field: 'email', error: 'Check the email address, or leave it empty.' }

  if (!(await rateLimit('site-feedback', 5, 60 * 60))) return { ok: false, error: TOO_MANY }
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { ok: false, error: TURNSTILE_FAILED }

  const aspects: Record<string, number> = {}
  for (const a of ASPECTS) {
    const v = Number(form.get(`aspect-${a.key}`))
    if (Number.isInteger(v) && v >= 1 && v <= 5) aspects[a.key] = v
  }
  const npsRaw = text(form, 'nps', 3)
  const nps = npsRaw !== '' && Number.isInteger(Number(npsRaw)) && Number(npsRaw) >= 0 && Number(npsRaw) <= 10 ? Number(npsRaw) : undefined
  const wants = form.getAll('wants').map(String).filter((w) => (WANTS as readonly string[]).includes(w))
  const role = text(form, 'role', 120)
  const source = text(form, 'source', 120)
  const page = text(form, 'page', 200)

  const member = await getCurrentMember()
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'site-feedback',
    data: {
      name: text(form, 'name', 200) || member?.name || undefined,
      email: email || member?.email || undefined,
      rating,
      aspects,
      nps,
      liked: text(form, 'liked') || undefined,
      message,
      wants,
      role: (ROLES as readonly string[]).includes(role) ? role : undefined,
      source: (SOURCES as readonly string[]).includes(source) ? source : undefined,
      contactOk: form.get('contactOk') === 'on',
      page: page.startsWith('/') ? page : undefined,
      member: member ? Number(member.id) : undefined,
      read: false,
    },
  })
  return { ok: true }
}
