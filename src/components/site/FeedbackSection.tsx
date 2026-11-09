import React from 'react'

import { SiteFeedbackForm } from './SiteFeedbackForm'

/** "Share Your Feedback" block placed at the end of public pages. */
export function FeedbackSection({ page, title = 'Share Your Feedback' }: { page: string; title?: string }) {
  return (
    <section className="sec" aria-labelledby="sfb-h" id="feedback">
      <div className="wrap">
        <div className="card pad-l grid c2 t1 g32" style={{ alignItems: 'start' }}>
          <div className="stack g12">
            <h2 className="sec-title" id="sfb-h">{title}</h2>
            <p className="muted" style={{ fontSize: '17px', lineHeight: '28px', margin: 0 }}>
              Tell us what works for you and what we can do better. Your ideas help us shape HSN&apos;s courses, case studies and resources for healthcare teams.
            </p>
          </div>
          <SiteFeedbackForm page={page} />
        </div>
      </div>
    </section>
  )
}
