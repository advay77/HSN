import type { Metadata } from 'next'
import React from 'react'

import '../../styles/pages/about.css'
import '../../styles/pages/advisory.css'

export const metadata: Metadata = {
  title: 'Advisory Board',
  description: 'Advisors guiding the Healthcare Sustainability Network, including Dr. Karan Thakur.',
}

export default function AdvisoryPage() {
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h1 className="sec-title">Advisory Board</h1>
            <p className="box-text">The Advisory Board guides the Healthcare Sustainability Network on health systems, sustainability, and how hospitals can put both into practice.</p>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="karan">
        <div className="wrap">
          <article className="card pad-l adv-person">
            <img className="adv-photo" src="/images/advisors/karan-thakur.webp" alt="Dr. Karan Thakur" />
            <div className="stack g16 grow">
              <div className="stack g8">
                <span className="bdg b-cat self-start">Advisor</span>
                <h2 className="h2" id="karan" style={{ margin: 0 }}>Dr. Karan Thakur</h2>
                <p className="lead" style={{ margin: 0 }}>Group Vice President — Corporate Affairs, Sustainability &amp; ESG, Apollo Hospitals Group</p>
              </div>
              <div className="adv-bio stack g16">
                <p>Dr. Karan Thakur is Group Vice President — Corporate Affairs, Sustainability &amp; ESG at Apollo Hospitals Group, where he leads the Group’s government and industry engagement alongside its Healthcare Sustainability &amp; ESG agenda. Working at the intersection of health policy, global health diplomacy, and corporate sustainability, he is Apollo’s consistent point of contact across major international partnerships — including the World Economic Forum, the International Hospital Federation, and IFC’s EPiHC platform.</p>
                <details className="adv-more">
                  <summary><span className="adv-more-t">Read more</span><span className="adv-less-t">Read less</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></summary>
                  <div className="stack g16">
                    <p>A seasoned healthcare administrator, he brings a broad range across health policy, hospital operations, projects, health communications, and sustainability &amp; ESG strategy. He has advised the Asian Development Bank as a Technical Consultant on Climate &amp; Health, serves as Senior Advisor to Scope Impact, and is an invited member of the Oxford Climate Leadership Centre.</p>
                    <p>His academic path spans the Harvard T.H. Chan School of Public Health, Manchester Business School at the University of Manchester, the Indian Institute of Management Bangalore, and National Law University, Delhi. He was India’s 2022 Global Fellow with the Eisenhower Fellowships — where he now sits on the India Nominating Committee — and a 2024 Chevening Gurukul Fellow for Leadership and Excellence at the University of Oxford.</p>
                    <p>Dr. Thakur holds a wide set of institutional roles: National Engagement Lead for PHFI’s Health &amp; Environment Leadership Platform (H.E.L.P.), Co-Chair of CAHO’s Program on Sustainability (CAPS), and committee or advisory positions with ASSOCHAM, FICCI, the Health Sector Skills Council, the Goa Institute of Management’s Centre for Health Systems Design and Management, and the FORE School of Management.</p>
                    <p>He is the author of the Handbook of Healthcare Sustainability and ESG — the first practitioner-focused guide linking climate and health for hospital administrators — and, released in April 2026, The Connected Clinician, on how physicians can harness digital tools for professional growth.</p>
                  </div>
                </details>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
