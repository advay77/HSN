// Ported from MembershipAr.dc.html (body only; the Arabic header and footer come from ar/layout.tsx).
import { headers } from 'next/headers'
import React from 'react'

import { MembershipTiersAr } from '@/components/membership/MembershipTiersAr'
import { getCurrentMember } from '@/lib/auth/session'
import { getPaymentProvider } from '@/lib/payments'
import { priceTable } from '@/lib/payments/prices'

import '../../styles/pages/membership-ar.css'

export const metadata = { title: 'العضوية' }
export const dynamic = 'force-dynamic'

export default async function MembershipArPage() {
  const [provider, member, h] = await Promise.all([getPaymentProvider(), getCurrentMember(), headers()])
  // The visitor's country from the host's geo header (Vercel), so the right prices show first.
  const country = h.get('x-vercel-ip-country')
  return (
    <main className="ar-mem">
      <MembershipTiersAr
        country={country}
        live={provider.live}
        prices={provider.live ? priceTable('ar-AE') : {}}
        defaults={member ? { name: member.name, email: member.email } : null}
      />
    </main>
  )
}
