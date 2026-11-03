import 'server-only'

import crypto from 'node:crypto'

import { getPrice, type PaymentProvider } from './index'

// Razorpay Payment Links. Needs RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET.
export const razorpayProvider: PaymentProvider = {
  id: 'razorpay',
  live: true,
  async createCheckout(req) {
    const price = getPrice(req.tier, req.region)
    if (!price) throw new Error(`No price set for ${req.tier} in ${req.region} (MEMBERSHIP_PRICES)`)
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const res = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: price.amount,
        currency: price.currency,
        description: `HSN membership: ${req.tier}`,
        reference_id: String(req.applicationId),
        customer: { name: req.name, email: req.email },
        callback_url: req.returnUrl,
        callback_method: 'get',
      }),
    })
    if (!res.ok) throw new Error(`Razorpay error ${res.status}: ${await res.text()}`)
    const link = (await res.json()) as { id: string; short_url: string }
    return { kind: 'redirect', url: link.short_url, reference: link.id }
  },
  async verifyWebhook(rawBody, headers) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return null
    const sig = headers.get('x-razorpay-signature') || ''
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(rawBody).digest('hex')
    if (!sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const event = JSON.parse(rawBody)
    if (event.event !== 'payment_link.paid') return null
    return { reference: event.payload?.payment_link?.entity?.id }
  },
}
