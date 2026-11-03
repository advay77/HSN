// Ported from Membership.dc.html (and its Membership-Modal states).
import React from 'react'

import { MembershipTiers } from '@/components/membership/MembershipTiers'
import { getCurrentMember } from '@/lib/auth/session'
import { getPaymentProvider } from '@/lib/payments'
import { priceTable } from '@/lib/payments/prices'

export const metadata = { title: 'Membership' }
export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const [provider, member] = await Promise.all([getPaymentProvider(), getCurrentMember()])
  return (
    <main>
      <MembershipTiers
        live={provider.live}
        prices={provider.live ? priceTable() : {}}
        defaults={member ? { name: member.name, email: member.email } : null}
      />
    </main>
  )
}
