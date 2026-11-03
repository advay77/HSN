'use server'

import { headers } from 'next/headers'

import { getCurrentMember } from '@/lib/auth/session'
import { getPaymentProvider, type Tier } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'
import { TURNSTILE_FAILED, verifyTurnstile } from '@/lib/turnstile'

export type JoinState = { ok: boolean; errors: Record<string, string>; redirect?: string }

const TIERS: Tier[] = ['student', 'individual', 'institutional']
const REGIONS = ['IN', 'AE', 'SA', 'OM', 'QA', 'KW', 'BH', 'INTL']
const COUNTRIES = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

// Membership modal (English and Arabic). Free: records the application and, for a signed-in member,
// activates the membership. Paid (PAYMENT_PROVIDER set): records it as awaiting payment and returns the checkout URL.
export async function joinMembership(_prev: JoinState, form: FormData): Promise<JoinState> {
  if (!(await rateLimit('membership', 10, 60 * 60))) return { ok: false, errors: { form: TOO_MANY } }
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { ok: false, errors: { form: TURNSTILE_FAILED } }
  const s = (k: string) => String(form.get(k) ?? '').trim()
  const ar = s('lang') === 'ar'
  const name = s('name')
  const email = s('email').toLowerCase()
  const country = s('country')
  const tier = s('tier') as Tier
  const region = REGIONS.includes(s('region')) ? s('region') : 'INTL'

  const errors: Record<string, string> = {}
  if (!name) errors.name = ar ? 'أدخل اسمك الكامل.' : 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ar ? 'أدخل بريدًا إلكترونيًا صحيحًا.' : 'Enter a valid email address, like name@hospital.org.'
  if (!COUNTRIES.includes(country)) errors.country = ar ? 'اختر بلدك.' : 'Select your country.'
  if (!TIERS.includes(tier)) errors.tier = ar ? 'اختر الفئة.' : 'Select a tier.'
  if (Object.keys(errors).length) return { ok: false, errors }

  const payload = await getPayloadClient()
  const provider = await getPaymentProvider()
  // Without a payment provider, membership is only given away when MEMBERSHIP_FREE=true is set on purpose;
  // otherwise the application waits for HSN to activate it in the admin panel.
  const freeMembership = process.env.MEMBERSHIP_FREE === 'true'
  const member = await getCurrentMember()

  const application = await payload.create({
    collection: 'membership-applications',
    data: {
      name,
      email,
      country,
      region,
      tier,
      member: member ? Number(member.id) : undefined,
      paymentStatus: provider.live || !freeMembership ? 'pending' : 'free',
      paymentProvider: provider.id,
    },
  })

  if (!provider.live) {
    if (member && freeMembership) {
      await payload.update({
        collection: 'members',
        id: member.id,
        data: { membershipTier: tier, membershipStatus: 'active' },
      })
    }
    return { ok: true, errors: {} }
  }

  try {
    const result = await provider.createCheckout({
      applicationId: application.id,
      tier,
      region,
      email,
      name,
      returnUrl: `${await siteOrigin()}${ar ? '/ar/membership' : '/membership'}?payment=done`,
    })
    if (result.kind === 'free') {
      await payload.update({ collection: 'membership-applications', id: application.id, data: { paymentStatus: 'free' } })
      return { ok: true, errors: {} }
    }
    await payload.update({
      collection: 'membership-applications',
      id: application.id,
      data: { paymentReference: result.reference },
    })
    return { ok: true, errors: {}, redirect: result.url }
  } catch (err) {
    payload.logger.error({ err }, 'Membership checkout failed')
    await payload.update({ collection: 'membership-applications', id: application.id, data: { paymentStatus: 'failed' } })
    return {
      ok: false,
      errors: { form: ar ? 'تعذّر بدء الدفع. حاول مرة أخرى لاحقًا.' : 'We couldn’t start the payment. Please try again later.' },
    }
  }
}
