'use client'

// Type filter, search and resource cards from Library.dc.html.
import Link from 'next/link'
import React, { useState } from 'react'

export type LibraryRow = {
  id: string
  type: 'Guide' | 'Toolkit' | 'Report' | 'Template'
  title: string
  desc: string
  format: string
  pages: string
  access: 'Free' | 'Members'
  href: string | null
  locked: boolean
}

const TYPES = ['All', 'Guide', 'Toolkit', 'Report', 'Template'] as const
const ICON: Record<LibraryRow['type'], React.CSSProperties> = {
  Guide: { background: '#E3F1E4', color: '#0B6B3A' },
  Toolkit: { background: '#DDF0F6', color: '#1C6E8A' },
  Report: { background: '#FBEFD5', color: '#8A5A00' },
  Template: { background: '#EDE7D8', color: '#17323A' },
}

export function LibraryList({ rows, signedIn }: { rows: LibraryRow[]; signedIn: boolean }) {
  const [ty, setTy] = useState<(typeof TYPES)[number]>('All')
  const [q, setQ] = useState('')
  const ql = q.trim().toLowerCase()
  const shown = rows.filter((r) => (ty === 'All' || r.type === ty) && (!ql || `${r.title} ${r.desc}`.toLowerCase().includes(ql)))

  return (
    <div className="wrap stack g32">
      <div className="stack g20">
        <div className="row between g16">
          <h2 className="h2" id="res">All Resources</h2>
          <span className="small muted" role="status">{`Showing ${shown.length} of ${rows.length} resources`}</span>
        </div>
        <div className="row g16 between">
          <div className="row g8 scrollx" role="group" aria-label="Filter by type">
            {TYPES.map((n) => {
              const on = ty === n
              return (
                <button key={n} className={on ? 'chp on' : 'chp'} aria-pressed={on} onClick={() => setTy(n)}>
                  {on && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>}{' '}
                  {n === 'All' ? 'All types' : n + 's'}{' '}<span className="cnt">{n === 'All' ? rows.length : rows.filter((r) => r.type === n).length}</span>
                </button>
              )
            })}
          </div>
          <div className="fld" style={{ flex: '0 1 360px', minWidth: '240px' }}>
            <label className="sr" htmlFor="ls">Search the library</label>
            <span className="sel" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '14px', top: '14px' }}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <input className="inp" id="ls" type="search" placeholder="Search the library" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingInlineStart: '44px' }} />
            </span>
          </div>
        </div>
      </div>
      {shown.length > 0 && (
        <div className="grid c2">
          {shown.map((r) => (
            <article key={r.id} className="card pad-l lib-card">
              <div className="lib-top">
                <span className="ic" style={ICON[r.type]}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"></path><path d="M14 3v5h5"></path><path d="M10 13h6"></path><path d="M10 17h6"></path></svg></span>
                <div className="row g8"><span className="bdg b-cat">{r.type}</span></div>
              </div>
              <h3 className="h4">{r.title}</h3>
              <p className="muted" style={{ margin: '0' }}>{r.desc}</p>
              <div className="lib-meta">{r.format && <span>{r.format}</span>}{r.pages && <span>{r.pages}</span>}<span>{r.access}</span></div>
              {r.href ? (
                r.locked ? (
                  <Link className="btn btn-s btn-sm self-start" style={{ marginTop: 'auto' }} href={r.href} aria-label={`${r.title}: ${signedIn ? 'members only, see membership' : 'members only, log in to view'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>
                    {signedIn ? 'Members only' : 'Log in to view'}
                  </Link>
                ) : (
                  <a className="btn btn-s btn-sm self-start" style={{ marginTop: 'auto' }} href={r.href} target="_blank" rel="noopener">View resource</a>
                )
              ) : null}
            </article>
          ))}
        </div>
      )}
      {rows.length === 0 && (
        <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h3 className="h4">No resources yet</h3>
          <p className="muted">HSN guides, toolkits, reports and templates will appear here as they are published.</p>
        </div>
      )}
      {rows.length > 0 && shown.length === 0 && (
        <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h3 className="h4">No resources match your search</h3>
          <p className="muted">Try another word, or show every type.</p>
          <button className="btn btn-s" onClick={() => { setTy('All'); setQ('') }}>Show all resources</button>
        </div>
      )}
    </div>
  )
}
