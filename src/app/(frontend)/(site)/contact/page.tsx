// Ported from Contact.dc.html.
import Link from 'next/link'
import React from 'react'

import { CONTACT_EMAIL } from '@/lib/site'

import '../../styles/pages/contact.css'

export const metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Contact Us</h1>
            <p className="lead">Questions about membership, courses, case studies or partnerships? Email the HSN team and we will get back to you.</p>
          </div>
          <div className="card pad-l stack ct-card">
            <span className="ic ic-g"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg></span>
            <h2 className="h4" style={{ margin: '0' }}>Email Us</h2>
            <a className="ct-mail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
      </section>
    </main>
  )
}
