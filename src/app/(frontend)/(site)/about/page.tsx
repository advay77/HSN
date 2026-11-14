// Ported from About.dc.html.
import React from 'react'

import '../../styles/pages/about.css'

import { MatchHeight } from '@/components/site/MatchHeight'
import { getSiteCopy } from '@/lib/site/copy'

export const metadata = { title: 'About Us' }

export default async function AboutPage() {
  const copy = await getSiteCopy()
  const story = copy.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <main>
      {/* Intro */}
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <div className="wrap stack g24">
          <div className="green-box light-box" data-about-box>
            <h1 className="sec-title">About Us</h1>
            <p className="box-text">{copy.aboutIntro}</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="sec-sm" aria-labelledby="mission" style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h2 className="sec-title" id="mission">Our Mission</h2>
            <p className="box-text">{copy.mission}</p>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="sec-sm" aria-labelledby="purpose" style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h2 className="sec-title" id="purpose">Our Purpose</h2>
            <p className="box-text">{copy.purpose}</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="sec-sm" aria-labelledby="story">
        <div className="wrap">
          <div className="green-box light-box">
            <h2 className="sec-title" id="story">Our Story</h2>
            {story[0] && <p className="box-text">{story[0]}</p>}
            {story.slice(1).map((p) => <p key={p} className="box-body">{p}</p>)}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* Same compact light box as About Us (HSN request). */}
      <section className="sec-sm" aria-labelledby="team" style={{ paddingTop: '0' }}>
        <div className="wrap">
          <MatchHeight source="[data-about-box]" className="green-box light-box team-box">
            <h2 className="sec-title" id="team">Our Team</h2>
            <p className="box-text">{copy.team}</p>
          </MatchHeight>
        </div>
      </section>

      {/* Partners */}
      {/* No top padding: the gap above Our Partners matches the gap between the boxes above it (HSN request). */}
      <section className="sec" aria-labelledby="partners" style={{ paddingTop: '0' }}>
        <div className="wrap stack g48">
          <div className="stack g16 center-head">
            <h2 className="sec-title" id="partners">Our Partners</h2>
            <p className="lead muted">{copy.partnersIntro}</p>
          </div>
          <div className="grid c3">
            <article className="card pad stack g16">
              <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M12 9v6M9 12h6"></path></svg></span>
              <h3 className="h4">{copy.partners[0]?.title}</h3>
              <p className="muted">{copy.partners[0]?.summary}</p>
            </article>
            <article className="card pad stack g16">
              <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6"></circle><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"></path></svg></span>
              <h3 className="h4">{copy.partners[1]?.title}</h3>
              <p className="muted">{copy.partners[1]?.summary}</p>
            </article>
            <article className="card pad stack g16">
              <span className="ic ic-l"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9z"></path><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"></path></svg></span>
              <h3 className="h4">{copy.partners[2]?.title}</h3>
              <p className="muted">{copy.partners[2]?.summary}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
