import React from 'react'

import '@/app/(frontend)/styles/site.css'

import { A11yEffects } from '@/components/site/A11yEffects'
import { PageTracker } from '@/components/site/PageTracker'
import { FeedbackTab } from '@/components/site/FeedbackTab'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { getCurrentMember } from '@/lib/auth/session'

// Every public page in the design is: .pg wrapper → Header → <main> → Footer.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember()
  return (
    <div className="pg" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#17323A', background: '#F5F1E6' }}>
      <Header member={member ? { name: member.name, initials: member.initials, membershipType: member.membershipType } : null} />
      {children}
      <Footer />
      <FeedbackTab />
      <A11yEffects />
      <PageTracker />
    </div>
  )
}
