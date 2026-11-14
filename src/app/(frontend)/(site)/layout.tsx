import React from 'react'

import '@/app/(frontend)/styles/site.css'

import { A11yEffects } from '@/components/site/A11yEffects'
import { PageTracker } from '@/components/site/PageTracker'
import { FeedbackTab } from '@/components/site/FeedbackTab'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { SiteDesignStyle } from '@/components/site/SiteDesignStyle'
import { getCurrentMember } from '@/lib/auth/session'
import { getSiteCopy } from '@/lib/site/copy'

// Every public page in the design is: .pg wrapper → Header → <main> → Footer.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [member, copy] = await Promise.all([getCurrentMember(), getSiteCopy()])
  return (
    <div className="pg" style={{ color: '#17323A', background: '#F5F1E6' }}>
      <SiteDesignStyle design={copy.design} />
      <Header member={member ? { name: member.name, initials: member.initials, membershipType: member.membershipType } : null} caseStudiesLabel={copy.caseStudiesMenu} nav={copy.nav} />
      {children}
      <Footer caseStudiesLabel={copy.caseStudiesMenu} tagline={copy.footerTagline} footer={copy.footer} logo1={copy.nav.logo1} logo2={copy.nav.logo2} />
      <FeedbackTab label={copy.feedbackTab} />
      <A11yEffects />
      <PageTracker />
    </div>
  )
}
