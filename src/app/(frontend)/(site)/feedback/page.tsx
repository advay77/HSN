import type { Metadata } from 'next'
import React from 'react'

import '@/app/(frontend)/styles/pages/site-feedback.css'

import { SiteFeedbackForm } from '@/components/site/SiteFeedbackForm'
import { requireMember } from '@/lib/auth/guard'
import { getSiteCopy } from '@/lib/site/copy'

export const metadata: Metadata = { title: 'Give Your Feedback', description: 'Tell the Healthcare Sustainability Network what works for you and what we can do better.' }

const Tick = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7BD389" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>

export default async function FeedbackPage() {
  // Members only: their name and email come from their account.
  const [, copy] = await Promise.all([requireMember('/feedback'), getSiteCopy()])
  return (
    <main>
      <section className="sec" style={{ paddingBottom: '24px' }}>
        <div className="wrap">
          <div className="sfb-hero">
            <span className="over" style={{ color: '#BFE6F3' }}>Feedback</span>
            <h1 className="sec-title" style={{ textTransform: 'none', letterSpacing: 0 }}>{copy.feedbackTitle}</h1>
            <p>{copy.feedbackIntro}</p>
            <ul>
              <li><Tick />7 short questions</li>
              <li><Tick />Only 2 are required</li>
              <li><Tick />Read by the HSN team</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: '920px' }}>
          <div className="sfb-card">
            <SiteFeedbackForm page="/feedback" />
          </div>
        </div>
      </section>
    </main>
  )
}
