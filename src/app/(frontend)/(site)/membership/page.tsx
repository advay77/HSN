// Ported from Membership.dc.html (and its Membership-Modal states).
import { headers } from 'next/headers'
import React from 'react'

import { MembershipTiers } from '@/components/membership/MembershipTiers'
import { getCurrentMember } from '@/lib/auth/session'
import { getPaymentProvider } from '@/lib/payments'
import { priceTable } from '@/lib/payments/prices'

export const metadata = { title: 'Membership' }
export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const [provider, member, h] = await Promise.all([getPaymentProvider(), getCurrentMember(), headers()])
  // The visitor's country from the host's geo header (Vercel), so the right prices show first.
  const country = h.get('x-vercel-ip-country')
  return (
    <main>
      <MembershipTiers
        country={country}
        live={provider.live}
        prices={provider.live ? priceTable() : {}}
        defaults={member ? { name: member.name, email: member.email } : null}
      />
    </main>
  )
}
