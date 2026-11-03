'use client'

// Body of Membership.dc.html: region selector, tier cards, compare table and the modal.
import Link from 'next/link'
import React, { useCallback, useState } from 'react'

import { MembershipModal, type TierId } from './MembershipModal'

const REGIONS = [
  { id: 'IN', label: 'India (₹ INR)', cur: '₹ INR' },
  { id: 'AE', label: 'UAE (AED)', cur: 'AED' },
  { id: 'SA', label: 'Saudi Arabia (SAR)', cur: 'SAR' },
  { id: 'OM', label: 'Oman (OMR)', cur: 'OMR' },
  { id: 'QA', label: 'Qatar (QAR)', cur: 'QAR' },
  { id: 'KW', label: 'Kuwait (KWD)', cur: 'KWD' },
  { id: 'BH', label: 'Bahrain (BHD)', cur: 'BHD' },
  { id: 'INTL', label: 'International (US$ USD)', cur: 'US$ USD' },
]
const TIERS: { id: TierId; name: string; initial: string; ic: string; tag?: string; blurb: string; features: string[] }[] = [
  { id: 'student', name: 'Student', initial: 'S', ic: 'ic-a', blurb: 'For students in healthcare, engineering and sustainability.', features: ['Access to the WhatsApp/LinkedIn community', 'Introductory micro-courses', 'Published case studies', 'Student badge'] },
  { id: 'individual', name: 'Individual Professional', initial: 'P', ic: 'ic-g', tag: 'For practitioners', blurb: 'For clinicians, quality managers, engineers and administrators.', features: ['Everything in Student', 'Full course library', 'Case study submissions', 'Verified HSN certificate'] },
  { id: 'institutional', name: 'Institutional', initial: 'I', ic: 'ic-t', blurb: 'For hospitals and health systems training their teams.', features: ['Up to 20 staff accounts', 'Institutional recognition on the website', 'Green audit toolkits', 'Benchmarking reports'] },
]
const TIER_NAMES = Object.fromEntries(TIERS.map((t) => [t.id, t.name])) as Record<TierId, string>

export function MembershipTiers({
  live,
  prices,
  defaults,
}: {
  live: boolean
  prices: Partial<Record<TierId, Record<string, string>>>
  defaults: { name: string; email: string } | null
}) {
  const [region, setRegion] = useState('IN')
  const [modalTier, setModalTier] = useState<TierId | null>(null)
  const close = useCallback(() => setModalTier(null), [])
  const currency = (REGIONS.find((r) => r.id === region) || REGIONS[0]!).cur
  const cta = live ? 'Join and pay' : 'Register interest'

  return (
    <>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Membership</h1>
            <p className="lead">Join a growing network of healthcare professionals and institutions leading sustainable care across India and the GCC.</p>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }} aria-labelledby="tiers-h">
        <div className="wrap stack g32">
          <h2 className="sr" id="tiers-h">Membership Tiers</h2>
          <div className="card pad row between g16" style={{ paddingBlock: '20px' }}>
            <div className="row g12">
              <span className="ic ic-a" style={{ width: '44px', height: '44px' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg></span>
              <div className="stack"><label className="lbl" htmlFor="region">Region &amp; currency</label><span className="small muted">Prices will be shown in your local currency.</span></div>
            </div>
            <span className="sel" style={{ flex: '0 1 340px', minWidth: '260px' }}>
              <select className="inp" id="region" style={{ fontWeight: '600' }} value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
          </div>
          <div className="grid c3 t1" style={{ alignItems: 'stretch' }}>
            {TIERS.map((t, i) => {
              const price = prices[t.id]?.[region]
              return (
                <article key={t.id} className="card stack" style={i === 1 ? { border: '2px solid #0B6B3A', boxShadow: '0 8px 24px rgba(19,78,94,.12)' } : undefined}>
                  <div className="pad stack g16" style={{ flex: '1' }}>
                    <div className="row between g8"><span className={`ic ${t.ic}`} style={{ width: '48px', height: '48px' }}>{t.initial}</span>{t.tag && <span className="bdg b-info">{t.tag}</span>}</div>
                    <div className="stack g4"><h3 className="h3">{t.name}</h3><p className="muted">{t.blurb}</p></div>
                    <div className="stack g4" style={{ padding: '16px', borderRadius: '12px', background: '#F5F1E6' }} aria-live="polite">
                      <span className="small strong muted">{currency}</span>
                      {live && price && <span className="row g8 end"><span className="metric-l">{price}</span><span className="muted strong" style={{ paddingBottom: '6px' }}>/ year</span></span>}
                      {(!live || !price) && <span className="h4">Pricing coming soon</span>}
                    </div>
                    <ul className="ticks">
                      {t.features.map((f) => (
                        <li key={f}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg><span>{f}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="pad" style={{ paddingTop: '0' }}>
                    <button className={i === 1 ? 'btn btn-p btn-block' : 'btn btn-s btn-block'} onClick={() => setModalTier(t.id)} disabled={live && !price}>{cta}</button>
                  </div>
                </article>
              )
            })}
          </div>
          {!live && <p className="small muted">Online payment isn’t available yet. Registering interest doesn’t commit you to anything; we’ll email you when membership opens.</p>}
        </div>
      </section>
      <section className="sec bg-surface" aria-labelledby="cmp">
        <div className="wrap stack g24">
          <h2 className="h2" id="cmp">Compare Tiers</h2>
          <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
            <table className="tbl" style={{ minWidth: '640px' }}>
              <thead><tr><th scope="col">Benefit</th><th scope="col">Student</th><th scope="col">Individual Professional</th><th scope="col">Institutional</th></tr></thead>
              <tbody>
                <tr><td>WhatsApp/LinkedIn community</td><td>Included</td><td>Included</td><td>Included</td></tr>
                <tr><td>Courses</td><td>Introductory micro-courses</td><td>Full course library</td><td>Full library for staff</td></tr>
                <tr><td>Case studies</td><td>Read published</td><td>Read and submit</td><td>Read and submit</td></tr>
                <tr><td>Recognition</td><td>Student badge</td><td>Verified HSN certificate</td><td>Institutional recognition on the website</td></tr>
                <tr><td>Accounts</td><td>1</td><td>1</td><td>Up to 20 staff accounts</td></tr>
                <tr><td>Tools</td><td>—</td><td>—</td><td>Green audit toolkits, benchmarking reports</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {modalTier && (
        <MembershipModal lang="en" live={live} tier={modalTier} tierNames={TIER_NAMES} region={region} defaults={defaults} onTier={setModalTier} onClose={close} />
      )}
    </>
  )
}
