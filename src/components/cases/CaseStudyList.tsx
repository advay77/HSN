'use client'

// Search box, count and expandable list from CaseStudies.dc.html.
import Link from 'next/link'
import React, { useState } from 'react'

export type CaseStudyRow = {
  slug: string
  title: string
  cat: string
  organization: string
  metric: string
  unit: string
  color: string
  summary: string
}

export function CaseStudyList({ rows }: { rows: CaseStudyRow[] }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>(rows[0] ? { [rows[0].slug]: true } : {})
  const ql = q.trim().toLowerCase()
  const shown = rows.filter((c) => !ql || `${c.title} ${c.cat} ${c.organization} ${c.summary}`.toLowerCase().includes(ql))
  const countLabel = shown.length + (shown.length === 1 ? ' case study' : ' case studies')

  return (
    <div className="wrap stack g24">
      <div className="row between g16">
        <h2 className="sr" id="all-cs">All Case Studies</h2>
        <div className="fld" style={{ flex: '1 1 360px', maxWidth: '560px' }}>
          <label className="sr" htmlFor="q">Search case studies</label>
          <span className="sel" style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '14px', top: '14px' }}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            <input className="inp" id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by keyword, e.g. anesthesia, solar, plastics" style={{ paddingInlineStart: '44px' }} disabled={rows.length === 0} />
          </span>
        </div>
        <span className="strong" role="status">{countLabel}</span>
      </div>
      {shown.length > 0 && (
        <ol className="cs-list">
          {shown.map((c) => {
            const isOpen = !!open[c.slug]
            return (
              <li key={c.slug} className={isOpen ? 'cs-item open' : 'cs-item'}>
                <button className="cs-head" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [c.slug]: !isOpen })}>
                  <span className="cs-swatch" style={{ background: c.color }} aria-hidden="true"></span>
                  <span className="cs-t"><span className="cs-tt">{c.title}</span><span className="cs-ts">{c.cat}{c.organization ? ` · By ${c.organization}` : ''}</span></span>
                  <span className="cs-m"><span className="cs-mm">{c.metric}</span><span className="cs-mu">{c.unit}</span></span>
                  <svg className={isOpen ? 'cs-chev up' : 'cs-chev'} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                {isOpen && (
                  <div className="cs-body">
                    <div className="stack g8">
                      <p>{c.summary}</p>
                      {c.metric && <span className="row g8 small muted"><strong style={{ color: '#0B6B3A' }}>{c.metric}</strong>{c.unit}</span>}
                    </div>
                    <Link className="btn btn-p" href={`/case-studies/${c.slug}`}>Read full case study<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg></Link>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {rows.length === 0 && (
        <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h2 className="h4">No case studies yet</h2>
          <p className="muted">Approved projects from the network will appear here. Be the first to share one.</p>
          <div className="row g12" style={{ justifyContent: 'center' }}><Link className="btn btn-p" href="/case-studies/submit">Submit a case study</Link></div>
        </div>
      )}
      {rows.length > 0 && shown.length === 0 && (
        <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h2 className="h4">No case studies match your search</h2>
          <p className="muted">Try another keyword, or be the first to share a project in this area.</p>
          <div className="row g12" style={{ justifyContent: 'center' }}><button className="btn btn-s" onClick={() => setQ('')}>Clear search</button><Link className="btn btn-p" href="/case-studies/submit">Submit a case study</Link></div>
        </div>
      )}
    </div>
  )
}
