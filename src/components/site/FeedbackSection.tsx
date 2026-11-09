import React from 'react'

import '@/app/(frontend)/styles/pages/site-feedback.css'

/** "Give your feedback" banner at the end of Home and About; the full form is on /feedback. */
export function FeedbackSection({ title = 'Help Us Improve HSN' }: { page?: string; title?: string }) {
  return (
    <section className="sec" aria-labelledby="sfb-h" id="feedback">
      <div className="wrap">
        <div className="sfb-band">
          <div>
            <h2 className="h2" id="sfb-h">{title}</h2>
            <p>Tell us what works for you and what we can do better. 7 short questions, about 3 minutes. Log in as a member to take part.</p>
          </div>
          <a className="btn btn-p btn-lg" href="/feedback">
            Give your feedback{' '}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </a>
        </div>
      </div>
    </section>
  )
}
