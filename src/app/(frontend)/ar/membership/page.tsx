// Ported from MembershipAr.dc.html (body only; the Arabic header and footer come from ar/layout.tsx).
import React from 'react'

import { MembershipTiersAr } from '@/components/membership/MembershipTiersAr'
import { getCurrentMember } from '@/lib/auth/session'
import { getPaymentProvider } from '@/lib/payments'
import { priceTable } from '@/lib/payments/prices'

import '../../styles/pages/membership-ar.css'

export const metadata = { title: 'العضوية' }
export const dynamic = 'force-dynamic'

export default async function MembershipArPage() {
  const [provider, member] = await Promise.all([getPaymentProvider(), getCurrentMember()])
  return (
    <main className="ar-mem">
      <MembershipTiersAr
        live={provider.live}
        prices={provider.live ? priceTable('ar-AE') : {}}
        defaults={member ? { name: member.name, email: member.email } : null}
      />
    </main>
  )
}
