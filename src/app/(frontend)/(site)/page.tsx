// Ported from Home.dc.html.
import React from 'react'
import { FeedbackSection } from '@/components/site/FeedbackSection'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="sec" style={{ paddingTop: '72px' }}>
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <div className="stack g24">
            <h1 className="sec-title hero-title">Healthcare Sustainability Network</h1>
            <p className="sec-sub">Advancing Sustainable Healthcare, Green Operations, and Decarbonization</p>
            <p className="lead measure">Bridging the gap between healthcare quality, patient safety, and environmental stewardship across health systems.</p>
          </div>
          <figure style={{ margin: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid #D9D2C1', boxShadow: '0 12px 32px rgba(19,78,94,.14)', background: '#DDF0F6', aspectRatio: '980 / 672' }}>
            <img src="/images/home-hero-photo.jpg" alt="A hospital quality team reviewing energy use and waste segregation on a ward sustainability dashboard" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </figure>
        </div>
      </section>

      {/* Key Focus Areas */}
      <section className="sec" aria-labelledby="kfa" style={{ background: 'linear-gradient(160deg, #E3F1E4 0%, #DDF0F6 100%)' }}>
        <div className="wrap stack g48">
          <h2 className="sec-title" id="kfa">Key Focus Areas</h2>
          <div className="grid c4">
            <article className="card pad stack g16" style={{ background: '#FFFDF8', borderColor: '#C9E2CF' }}>
              <span className="ic ic-g" title="Health, safety and policy standards"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"></path><path d="m9 12 2 2 4-4"></path></svg></span>
              <h3 className="h4">Environmental Health, Safety, and Policy Standards</h3>
              <p className="muted">Aligning clinical governance quality metrics with global and regional environmental benchmarks.</p>
            </article>
            <article className="card pad stack g16" style={{ background: '#FFFDF8', borderColor: '#C9E2CF' }}>
              <span className="ic ic-g" title="Hospital operations and energy"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V8l7-5 7 5v13"></path><path d="m12.5 9-2.5 4h3l-2.5 4"></path></svg></span>
              <h3 className="h4">Sustainable Hospital Operations &amp; Energy Management</h3>
              <p className="muted">Driving energy efficiency, resource conservation, and operational resilience.</p>
            </article>
            <article className="card pad stack g16" style={{ background: '#FFFDF8', borderColor: '#C9E2CF' }}>
              <span className="ic ic-g" title="Recycling and circular economy"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.2 9.5"></path><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2.1"></path><path d="m14 16-3 3 3 3"></path><path d="M8.3 13.6 7.2 9.5l-4.1 1.1"></path><path d="m9.3 5.8 1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.9 6.8"></path><path d="m13.4 9.6 4.1 1.1 1.1-4.1"></path></svg></span>
              <h3 className="h4">Green Procurement, Waste Reduction &amp; Circular Economy</h3>
              <p className="muted">Optimizing supply chains, diverting medical waste, and advancing circular resource use.</p>
            </article>
            <article className="card pad stack g16" style={{ background: '#FFFDF8', borderColor: '#C9E2CF' }}>
              <span className="ic ic-g" title="Case studies and research"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5"></path><path d="M14 2v6h6"></path><path d="M20 8v3"></path><path d="M8 13h4M8 17h2"></path><circle cx="17" cy="17" r="3"></circle><path d="m21 21-1.8-1.8"></path></svg></span>
              <h3 className="h4">Case Studies, Research &amp; Best Practices</h3>
              <p className="muted">Sharing practical, field-tested evidence and scalable implementation models.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Network Impact */}
      <section className="sec bg-teal" aria-labelledby="impact">
        <div className="wrap stack g40">
          <h2 className="sec-title" id="impact">Network Impact</h2>
          <div className="grid c2">
            <div className="stack g12" style={{ padding: '24px 28px', borderRadius: '16px', background: '#0F4251', border: '1px solid #2D6878' }}>
              <div className="row nowrap g12" style={{ alignItems: 'center' }}><span className="ic" style={{ background: '#5BC0E3', color: '#0E1F22' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2a5 5 0 0 1 5.5 5.3"></path></svg></span><h3 className="h3" style={{ margin: 0 }}>Community</h3></div>
              <p className="muted" style={{ margin: 0, fontSize: '17px', lineHeight: '28px' }}>A dedicated collective of healthcare professionals, quality and patient safety professionals, clinicians, and health system administrators.</p>
            </div>
            <div className="stack g12" style={{ padding: '24px 28px', borderRadius: '16px', background: '#0F4251', border: '1px solid #2D6878' }}>
              <div className="row nowrap g12" style={{ alignItems: 'center' }}><span className="ic" style={{ background: '#4FAE4E', color: '#0E1F22' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle></svg></span><h3 className="h3" style={{ margin: 0 }}>Goal</h3></div>
              <p className="muted" style={{ margin: 0, fontSize: '17px', lineHeight: '28px' }}>Driving measurable, low-carbon transformation across regional healthcare organizations.</p>
            </div>
          </div>
        </div>
      </section>
      <FeedbackSection page="/" />
    </main>
  )
}
