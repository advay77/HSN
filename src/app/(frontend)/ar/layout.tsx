import React from 'react'

import '@/app/(frontend)/styles/site.css'

import '../styles/pages/ar.css'

import { ArFooter } from '@/components/ar/ArFooter'
import { ArHeader } from '@/components/ar/ArHeader'
import { A11yEffects } from '@/components/site/A11yEffects'
import { PageTracker } from '@/components/site/PageTracker'
import { getCurrentMember } from '@/lib/auth/session'

// Every Arabic page (HomeAr.dc.html, MembershipAr.dc.html): right-to-left wrapper → Arabic header → <main> → Arabic footer.
export default async function ArabicLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember()
  return (
    <div className="pg ar-pg" dir="rtl" lang="ar" style={{ color: '#17323A', background: '#F5F1E6' }}>
      <ArHeader member={member ? { name: member.name, initials: member.initials } : null} />
      {children}
      <ArFooter />
      <A11yEffects />
      <PageTracker />
    </div>
  )
}
