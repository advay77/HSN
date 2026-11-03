import { NextResponse, type NextRequest } from 'next/server'

import { getPaymentProvider } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'

// Payment provider webhook (Razorpay payment_link.paid / Stripe checkout.session.completed).
// Marks the membership application paid and activates the member.
export async function POST(req: NextRequest) {
  const provider = await getPaymentProvider()
  if (!provider.live) return NextResponse.json({ ok: false, error: 'Payments are not enabled' }, { status: 404 })

  const raw = await req.text()
  const paid = await provider.verifyWebhook(raw, req.headers)
  if (!paid?.reference) return NextResponse.json({ ok: true, ignored: true })

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'membership-applications',
    where: { paymentReference: { equals: paid.reference } },
    limit: 1,
    depth: 0,
  })
  const app = docs[0]
  if (!app) return NextResponse.json({ ok: true, unknown: true })
  if (app.paymentStatus === 'paid') return NextResponse.json({ ok: true })

  await payload.update({ collection: 'membership-applications', id: app.id, data: { paymentStatus: 'paid' } })

  // The member who applied, or an existing member with the same email.
  let memberId = typeof app.member === 'object' && app.member ? app.member.id : app.member
  if (!memberId) {
    const found = await payload.find({ collection: 'members', where: { email: { equals: app.email.toLowerCase() } }, limit: 1, depth: 0 })
    memberId = found.docs[0]?.id
  }
  if (memberId) {
    await payload.update({ collection: 'members', id: memberId, data: { membershipTier: app.tier, membershipStatus: 'active' } })
  }
  return NextResponse.json({ ok: true })
}
