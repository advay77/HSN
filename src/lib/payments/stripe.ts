import 'server-only'

import crypto from 'node:crypto'

import { getPrice, type PaymentProvider } from './index'

// Stripe Checkout through the REST API (no SDK needed). Needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  live: true,
  async createCheckout(req) {
    const price = getPrice(req.tier, req.region)
    if (!price) throw new Error(`No price set for ${req.tier} in ${req.region} (MEMBERSHIP_PRICES)`)
    const body = new URLSearchParams({
      mode: 'payment',
      customer_email: req.email,
      client_reference_id: String(req.applicationId),
      success_url: req.returnUrl,
      cancel_url: req.returnUrl,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': price.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(price.amount),
      'line_items[0][price_data][product_data][name]': `HSN membership: ${req.tier}`,
    })
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      body,
    })
    if (!res.ok) throw new Error(`Stripe error ${res.status}: ${await res.text()}`)
    const session = (await res.json()) as { id: string; url: string }
    return { kind: 'redirect', url: session.url, reference: session.id }
  },
  async verifyWebhook(rawBody, headers) {
    // Stripe-Signature: t=timestamp,v1=signature
    if (!process.env.STRIPE_WEBHOOK_SECRET) return null
    const header = headers.get('stripe-signature') || ''
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
    if (!parts.t || !parts.v1) return null
    const expected = crypto
      .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET || '')
      .update(`${parts.t}.${rawBody}`)
      .digest('hex')
    if (parts.v1.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected))) return null
    if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return null
    const event = JSON.parse(rawBody)
    if (event.type !== 'checkout.session.completed' || event.data?.object?.payment_status !== 'paid') return null
    return { reference: event.data?.object?.id }
  },
}
