// Ported from About.dc.html.
import Link from 'next/link'
import React from 'react'

import '../../styles/pages/about.css'

export const metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <main>
      {/* Intro */}
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <div className="wrap stack g24">
          <div className="green-box light-box">
            <h1 className="sec-title">About Us</h1>
            <p className="box-text">The Healthcare Sustainability Network (HSN) is a dedicated collective of healthcare professionals, quality managers, clinicians, and health system administrators committed to advancing sustainable practices, green operations, and decarbonization across the healthcare sector.</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="sec-sm" aria-labelledby="mission" style={{ paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h2 className="sec-title" id="mission">Our Mission</h2>
            <p className="box-text">Our mission is to bridge the gap between healthcare quality, patient safety, and environmental stewardship—empowering healthcare professionals to drive measurable, low-carbon transformation within their organizations.</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="sec-sm" aria-labelledby="story">
        <div className="wrap">
          <div className="green-box light-box">
            <h2 className="sec-title" id="story">Our Story</h2>
            <p className="box-text">HSN was founded out of a clear operational realization: while sustainability is globally recognized as a priority, healthcare leaders and frontline clinical staff often lack practical, grounded frameworks to integrate green practices into daily hospital routines without compromising patient safety or clinical outcomes.</p>
            <p className="box-body">Starting as an initiative focused on bridging clinical quality governance with environmental standards—such as international accreditation guidelines and regional health directives—HSN rapidly grew into a dedicated professional network.</p>
            <p className="box-body">Today, HSN connects healthcare leaders, quality and patient safety professionals, clinical leads, facility heads, and sustainability advocates working collectively to transform health facilities across the region into sustainable centers of excellence.</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="sec" aria-labelledby="team" style={{ background: 'linear-gradient(160deg, #E3F1E4 0%, #DDF0F6 100%)' }}>
        <div className="wrap stack g48">
          <div className="stack g16 center-head">
            <h2 className="sec-title" id="team">Our Team</h2>
            <p className="lead muted">Our network is driven by experienced healthcare quality leaders, clinical governance specialists, environmental health advisors, and sustainability champions with deep expertise across healthcare systems.</p>
          </div>
          <article className="card pad-l row g24 top" style={{ background: '#134E5E', borderColor: '#134E5E', color: '#F5F1E6' }}>
            <span className="ic" style={{ background: '#5BC0E3', color: '#0E1F22' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"></path><path d="m9 12 2 2 4-4"></path></svg></span>
            <div className="stack g8 grow" style={{ minWidth: '260px' }}>
              <h3 className="h3" style={{ color: '#FFFFFF' }}>Core Advisory &amp; Leadership</h3>
              <p className="lead" style={{ color: '#DCE6E2', maxWidth: 'none', margin: '0' }}>Healthcare leaders with extensive backgrounds in hospital accreditation, clinical audit, risk management, and Sustainable Quality Improvement (SusQI).</p>
              <Link className="btn btn-light" href="/advisory" style={{ alignSelf: 'flex-start' }}>Meet the Advisory Board</Link>
            </div>
          </article>
        </div>
      </section>

      {/* Partners */}
      <section className="sec" aria-labelledby="partners">
        <div className="wrap stack g48">
          <div className="stack g16 center-head">
            <h2 className="sec-title" id="partners">Our Partners</h2>
            <p className="lead muted">We collaborate alongside forward-thinking health organizations, accreditation partners, and academic institutions committed to sustainable healthcare transformation.</p>
          </div>
          <div className="grid c3">
            <article className="card pad stack g16">
              <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M12 9v6M9 12h6"></path></svg></span>
              <h3 className="h4">Healthcare Delivery Partners</h3>
              <p className="muted">Hospitals, medical centers, and outpatient networks implementing sustainability initiatives.</p>
            </article>
            <article className="card pad stack g16">
              <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6"></circle><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"></path></svg></span>
              <h3 className="h4">Quality &amp; Accreditation Networks</h3>
              <p className="muted">Professional health associations and quality bodies aligning patient care standards with environmental stewardship.</p>
            </article>
            <article className="card pad stack g16">
              <span className="ic ic-l"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9z"></path><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"></path></svg></span>
              <h3 className="h4">Knowledge &amp; Academic Collaborators</h3>
              <p className="muted">Technical advisors, sustainability experts, and educational facilitators contributing to evidence-based healthcare decarbonization.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
