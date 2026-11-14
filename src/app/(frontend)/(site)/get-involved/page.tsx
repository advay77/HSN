// Ported from GetInvolved.dc.html.
import Link from 'next/link'
import React from 'react'

import { CONTACT_EMAIL, SOCIAL } from '@/lib/site'
import { getSiteCopy } from '@/lib/site/copy'

import '../../styles/pages/get-involved.css'

export const metadata = { title: 'Get Involved' }

export default async function GetInvolvedPage() {
  const copy = await getSiteCopy()
  const card = (i: number) => copy.involved[i] || { title: '', summary: '' }
  return (
    <main className="gi-page">
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title">{copy.involvedTitle}</h1>
            <p className="lead">{copy.involvedIntro}</p>
            <nav className="row g8" aria-label="Jump to group">
              <a className="chp" href="#pros" style={{ textDecoration: 'none' }}>{copy.involvedJumpPros}</a>
              <a className="chp" href="#hosp" style={{ textDecoration: 'none' }}>{copy.involvedJumpHospitals}</a>
              <a className="chp" href="#res" style={{ textDecoration: 'none' }}>{copy.involvedJumpResearchers}</a>
            </nav>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap stack g24">
          <article id="pros" className="card pad-l side" aria-labelledby="pros-h">
            <div className="stack g16">
              <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2a5 5 0 0 1 5.5 5.3"></path></svg></span>
              <h2 className="h3" id="pros-h">{copy.involvedPros}</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(0).title}</h3>
                <p className="muted">{card(0).summary}</p>
                <a className="btn btn-p self-start" href={SOCIAL.whatsapp} target="_blank" rel="noopener" style={{ marginTop: 'auto' }}>{copy.involvedButtons[0]}</a>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(1).title}</h3>
                <p className="muted">{card(1).summary}</p>
                {/* The design linked one specific course; it points to the course list until HSN publishes the SusQI course. */}
                <Link className="btn btn-s self-start" href="/courses" style={{ marginTop: 'auto' }}>{copy.involvedButtons[1]}</Link>
              </div>
            </div>
          </article>
          <article id="hosp" className="card pad-l side" aria-labelledby="hosp-h">
            <div className="stack g16">
              <span className="ic ic-t"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M12 9v6M9 12h6"></path></svg></span>
              <h2 className="h3" id="hosp-h">{copy.involvedHospitals}</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(2).title}</h3>
                <p className="muted">{card(2).summary}</p>
                <Link className="btn btn-p self-start" href="/membership" style={{ marginTop: 'auto' }}>{copy.involvedButtons[2]}</Link>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(3).title}</h3>
                <p className="muted">{card(3).summary}</p>
                <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}?subject=Workshop%20request`} style={{ marginTop: 'auto' }}>{copy.involvedButtons[3]}</a>
              </div>
            </div>
          </article>
          <article id="res" className="card pad-l side" aria-labelledby="res-h">
            <div className="stack g16">
              <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9z"></path><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"></path></svg></span>
              <h2 className="h3" id="res-h">{copy.involvedResearchers}</h2>
            </div>
            <div className="grid c2">
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(4).title}</h3>
                <p className="muted">{card(4).summary}</p>
                <Link className="btn btn-p self-start" href="/case-studies/submit" style={{ marginTop: 'auto' }}>{copy.involvedButtons[4]}</Link>
              </div>
              <div className="stack g12 pad" style={{ borderRadius: '14px', background: '#F5F1E6' }}>
                <h3 className="h4">{card(5).title}</h3>
                <p className="muted">{card(5).summary}</p>
                <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}?subject=Speaking%20opportunity`} style={{ marginTop: 'auto' }}>{copy.involvedButtons[5]}</a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
