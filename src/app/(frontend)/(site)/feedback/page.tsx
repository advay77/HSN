import type { Metadata } from 'next'
import React from 'react'

import { FeedbackSection } from '@/components/site/FeedbackSection'

export const metadata: Metadata = { title: 'Feedback', description: 'Share your feedback with the Healthcare Sustainability Network.' }

export default function FeedbackPage() {
  return (
    <main>
      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap stack g12">
          <h1 className="sec-title">Feedback</h1>
          <p className="lead measure">We would love to hear from you about the website, our courses and resources, or anything else.</p>
        </div>
      </section>
      <FeedbackSection page="/feedback" title="Your Feedback" />
    </main>
  )
}
