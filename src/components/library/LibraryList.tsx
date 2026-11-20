'use client'

// Library resources grouped under type headings. A heading opens a short table: title, access, download.
import Link from 'next/link'
import React, { useState } from 'react'

export type LibraryRow = {
  id: string
  type: 'Guide' | 'Toolkit' | 'Checklist' | 'Report' | 'Template' | 'Policy/Program'
  title: string
  desc: string
  format: string
  pages: string
  access: 'Free' | 'Members'
  href: string | null
  locked: boolean
}

const GROUPS: LibraryRow['type'][] = ['Guide', 'Toolkit', 'Checklist', 'Report', 'Template', 'Policy/Program']
const groupName = (type: LibraryRow['type']) => (type === 'Policy/Program' ? 'Policies/Programs' : `${type}s`)

export function LibraryList({ rows, signedIn }: { rows: LibraryRow[]; signedIn: boolean }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<LibraryRow['type'] | null>(null)
  const ql = q.trim().toLowerCase()
  const shown = rows.filter((r) => !ql || `${r.title} ${r.desc}`.toLowerCase().includes(ql))
  const groups = GROUPS.map((type) => ({ type, items: shown.filter((r) => r.type === type) })).filter((g) => !ql || g.items.length > 0)

  return (
    <div className="wrap stack g24">
      <div className="row between g16">
        <span className="small muted" role="status">{`Showing ${shown.length} of ${rows.length}`}</span>
        <div className="fld" style={{ flex: '0 1 360px', minWidth: '220px', margin: 0 }}>
          <label className="sr" htmlFor="ls">Search the library</label>
          <span className="sel" style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '14px', top: '14px' }}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            <input className="inp" id="ls" type="search" placeholder="Search the library" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingInlineStart: '44px' }} />
          </span>
        </div>
      </div>
      {groups.length > 0 && (
        <div className="stack g12">
          {groups.map((g) => {
            const on = open === g.type || ql.length > 0
            return (
              <section key={g.type} className="lib-sec">
                <h2 className="lib-h">
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on && !ql ? null : g.type)}>
                    <span>{groupName(g.type)}</span>
                    <span className="row g8">
                      <span className="cnt">{g.items.length}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ transform: on ? 'rotate(90deg)' : undefined }}><path d="m9 6 6 6-6 6"></path></svg>
                    </span>
                  </button>
                </h2>
                {on && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tbl lib-tbl">
                      <caption className="sr">{groupName(g.type)}</caption>
                      <thead>
                        <tr><th scope="col">Title</th><th scope="col">Access</th><th scope="col"><span className="sr">Download</span></th></tr>
                      </thead>
                      <tbody>
                        {g.items.length === 0 && (
                          <tr><td colSpan={3} className="muted">No documents in this group yet.</td></tr>
                        )}
                        {g.items.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <span className="strong">{r.title}</span>
                              {r.desc && <span className="small muted" style={{ display: 'block', marginTop: '2px' }}>{r.desc}</span>}
                            </td>
                            <td><span className={r.access === 'Members' ? 'bdg b-reg' : 'bdg b-ok'}>{r.access === 'Members' ? 'Member Access' : 'Open Access'}</span></td>
                            <td style={{ textAlign: 'end', width: '1%' }}>
                              {r.href ? (
                                r.locked ? (
                                  <Link className="btn btn-s btn-sm" href={r.href}>{signedIn ? 'Members only' : 'Log in to view'}</Link>
                                ) : (
                                  <a className="btn btn-s btn-sm" href={r.href} target="_blank" rel="noopener">Download</a>
                                )
                              ) : <span className="small muted">No file yet</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
      {rows.length === 0 && (
        <div className="card pad stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h3 className="h4">No resources yet</h3>
          <p className="muted">Guides, checklists, and the other documents will appear here as they are published.</p>
        </div>
      )}
      {rows.length > 0 && groups.length === 0 && (
        <div className="card pad stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h3 className="h4">No resources match your search</h3>
          <button className="btn btn-s" onClick={() => setQ('')}>Show all resources</button>
        </div>
      )}
    </div>
  )
}
