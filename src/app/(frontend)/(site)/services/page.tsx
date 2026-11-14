// Ported from Services.dc.html.
import Link from 'next/link'
import React from 'react'

export const metadata = { title: 'Our Services' }

const SERVICES = [
  {
    title: 'Sustainable Quality Improvement (SusQI) Advisory & Mentorship',
    summary: 'We help facilities embed SusQI methods into existing Quality Management Systems, clinical pathways and policy frameworks, with hands-on mentorship along the way.',
  },
  {
    title: 'Institutional Micro-Learning & Workforce Capability Building',
    summary: 'Interactive, bite-sized training programs, SusQI workshops, and QR-coded digital micro-learning modules for every team, from wards to the boardroom.',
  },
  {
    title: 'Environmental Health & Accreditation Readiness',
    summary: 'Technical guidance to meet regional sustainability targets and international environmental accreditation standards, including International Healthcare Standards such as JCI, ACHS, etc.',
  },
  {
    title: 'Sustainable Hospital Operations & Resource Optimization',
    summary: 'Baseline audits and carbon footprint assessments of energy, water, medical waste and facility operations to find tangible efficiency gains.',
  },
  {
    title: 'Green Procurement & Circular Economy Advisory',
    summary: 'Sustainable purchasing frameworks, green supply chain criteria and supplier benchmarks that lower life-cycle impacts and operational costs.',
  },
]

export default function ServicesPage() {
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div className="wrap stack g24">
          <h1 className="sec-title">Our Services</h1>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap stack g20">
          {SERVICES.map((s, i) => (
            <article key={s.title} className="card pad-l stack g16">
              <div className="row nowrap g16" style={{ alignItems: 'center' }}>
                <span className="num" style={{ width: '52px', height: '52px', fontSize: '21px' }}>{i + 1}</span>
                <h2 className="h3" style={{ margin: '0' }}>{s.title}</h2>
              </div>
              <p className="lead" style={{ margin: '0' }}>{s.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
