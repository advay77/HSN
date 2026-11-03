// Ported from GetInvolved.dc.html.
import Link from 'next/link'
import React from 'react'

import { CONTACT_EMAIL, SOCIAL } from '@/lib/site'

import '../../styles/pages/get-involved.css'

export const metadata = { title: 'Get Involved' }

export default function GetInvolvedPage() {
  return (
    <main className="gi-page">
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Get Involved</h1>
            <p className="lead">Whether you lead a ward, run a hospital or research healthcare decarbonization, there’s a practical way to take part.</p>
            <nav className="row g8" aria-label="Jump to group">
              <a className="chp" href="#pros" style={{ textDecoration: 'none' }}>Professionals &amp; Clinicians</a>
              <a className="chp" href="#hosp" style={{ textDecoration: 'none' }}>Hospitals &amp; Health Systems</a>
              <a className="chp" href="#res" style={{ textDecoration: 'none' }}>Researchers &amp; Experts</a>
            </nav>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap stack g24">
          <article id="pros" className="card pad-l side" aria-labelledby="pros-h">
            <div className="stack g16">
              <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2a5 5 0 0 1 5.5 5.3"></path></svg></span>
              <h2 className="h3" id="pros-h">Healthcare Professionals &amp; Clinicians</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Join the Collective</h3>
                <p className="muted">Connect with peer clinicians, quality managers, and administrators to share real-world challenges, strategies, and solutions.</p>
                <a className="btn btn-p self-start" href={SOCIAL.whatsapp} target="_blank" rel="noopener" style={{ marginTop: 'auto' }}>Join the community</a>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Implement a Sustainable Project</h3>
                <p className="muted">Lead a green initiative or SusQI project in your unit using HSN templates and peer guidance.</p>
                {/* The design linked one specific course; it points to the course list until HSN publishes the SusQI course. */}
                <Link className="btn btn-s self-start" href="/courses" style={{ marginTop: 'auto' }}>Start with the SusQI course</Link>
              </div>
            </div>
          </article>
          <article id="hosp" className="card pad-l side" aria-labelledby="hosp-h">
            <div className="stack g16">
              <span className="ic ic-t"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M12 9v6M9 12h6"></path></svg></span>
              <h2 className="h3" id="hosp-h">Hospitals &amp; Health Systems</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Institutional Partnership</h3>
                <p className="muted">Partner with HSN to train staff, benchmark sustainable operational metrics, and elevate green healthcare leadership.</p>
                <Link className="btn btn-p self-start" href="/membership" style={{ marginTop: 'auto' }}>See institutional membership</Link>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Host Collaborative Workshops</h3>
                <p className="muted">Work with HSN to run internal training sessions on sustainable waste management, energy reduction, and green procurement.</p>
                <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}?subject=Workshop%20request`} style={{ marginTop: 'auto' }}>Plan a workshop</a>
              </div>
            </div>
          </article>
          <article id="res" className="card pad-l side" aria-labelledby="res-h">
            <div className="stack g16">
              <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9z"></path><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"></path></svg></span>
              <h2 className="h3" id="res-h">Researchers &amp; Experts</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Share Best Practices &amp; Research</h3>
                <p className="muted">Submit case studies, research papers, and technical guides to be featured across HSN channels.</p>
                <Link className="btn btn-p self-start" href="/case-studies/submit" style={{ marginTop: 'auto' }}>Submit a case study</Link>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">Speaking Opportunities</h3>
                <p className="muted">Present at HSN webinars, expert panels, and technical roundtables.</p>
                <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}?subject=Speaking%20opportunity`} style={{ marginTop: 'auto' }}>Offer to speak</a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
