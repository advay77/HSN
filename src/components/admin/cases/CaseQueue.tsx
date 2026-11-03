'use client'

// Interactive part of AdminCases.dc.html: tabs, approve / return with a note / reject, undo, unpublish.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { decideCaseStudy, deleteCaseStudy, undoCaseDecision, unpublishCaseStudy } from '@/app/(frontend)/admin/case-studies/actions'

export type QueueItem = {
  id: number
  slug: string
  title: string
  cat: string
  region: string
  when: string
  by: string
  email: string
  org: string
  metric: string
  unit: string
  summary: string
  files: { name: string; url: string }[]
}
export type PublishedRow = { id: number; slug: string; title: string; org: string; cat: string; region: string; impact: string; when: string }
export type OtherRow = { id: number; title: string; org: string; cat: string; status: string; statusCls: string; when: string }

type Decision = 'published' | 'returned' | 'rejected'
const fileIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg>
)

export function CaseQueue({ initialTab, queue, published, other }: { initialTab: 'q' | 'p' | 'o'; queue: QueueItem[]; published: PublishedRow[]; other: OtherRow[] }) {
  const router = useRouter()
  const [tab, setTab] = useState(initialTab)
  const [dec, setDec] = useState<Record<number, { d: Decision; emailed: boolean }>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [open, setOpen] = useState<number | null>(null)
  const [ask, setAsk] = useState<number | null>(null)
  const [error, setError] = useState<Record<number, string>>({})
  const [askDelete, setAskDelete] = useState<number | null>(null)
  const [pending, start] = useTransition()

  const pend = queue.filter((i) => !dec[i.id])
  const labels = (d: Decision, emailed: boolean, hasEmail: boolean): [string, string, string] => {
    const told = emailed ? '' : hasEmail ? ' Email is not set up, so let them know yourself.' : ' There is no email address to notify.'
    if (d === 'published') return ['Approved', 'bdg b-ok', 'Published to the case study repository.']
    if (d === 'returned') return ['Returned', 'bdg b-err', emailed ? 'Your note was emailed to the submitter.' : 'Your note is on their dashboard.' + told]
    return ['Rejected', 'bdg b-reg', emailed ? 'The submitter was told it won’t be published.' : 'It won’t be published.' + told]
  }

  const decide = (id: number, d: Decision) =>
    start(async () => {
      setError((e) => ({ ...e, [id]: '' }))
      const r = await decideCaseStudy(id, d, notes[id])
      if (!r.ok) {
        setError((e) => ({ ...e, [id]: r.error }))
        return
      }
      setDec((x) => ({ ...x, [id]: { d, emailed: r.emailed } }))
      setOpen(null)
      setAsk(null)
      router.refresh()
    })
  const undo = (id: number) =>
    start(async () => {
      await undoCaseDecision(id)
      setDec((x) => {
        const n = { ...x }
        delete n[id]
        return n
      })
      router.refresh()
    })
  const unpublish = (id: number) =>
    start(async () => {
      await unpublishCaseStudy(id)
      router.refresh()
    })
  const remove = (id: number) =>
    start(async () => {
      await deleteCaseStudy(id)
      setAskDelete(null)
      router.refresh()
    })

  const pubCount = published.length

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Case study lists">
        <button className={tab === 'q' ? 'tab on' : 'tab'} role="tab" aria-selected={tab === 'q'} onClick={() => setTab('q')}>Approval queue{' '}<span className="cnt" style={{ marginInlineStart: '6px' }}>{pend.length}</span></button>
        <button className={tab === 'p' ? 'tab on' : 'tab'} role="tab" aria-selected={tab === 'p'} onClick={() => setTab('p')}>Published{' '}<span className="cnt" style={{ marginInlineStart: '6px' }}>{pubCount}</span></button>
        <button className={tab === 'o' ? 'tab on' : 'tab'} role="tab" aria-selected={tab === 'o'} onClick={() => setTab('o')}>Drafts &amp; returned{' '}<span className="cnt" style={{ marginInlineStart: '6px' }}>{other.length}</span></button>
      </div>

      {tab === 'q' && (
        <div className="stack g16" role="tabpanel">
          {queue.map((q) => {
            const d = dec[q.id]
            const isOpen = open === q.id && !d
            const isAsk = ask === q.id && !d
            const [decLabel, decCls, decText] = d ? labels(d.d, d.emailed, !!q.email) : ['', '', '']
            return (
              <article key={q.id} className="qcard">
                <div className="row between top g12">
                  <div className="stack g8">
                    <div className="row g8"><span className="bdg b-cat">{q.cat}</span>{q.region && <span className="bdg b-reg">{q.region}</span>}<span className="small muted">Submitted {q.when}</span></div>
                    <h2 className="h4" style={{ margin: 0 }}>{q.title}</h2>
                    <span className="small">By{' '}<strong>{q.by}</strong>{q.org && <>{' '}· {q.org}</>}</span>
                  </div>
                  {q.metric && <div className="stack" style={{ padding: '12px 16px', borderRadius: '12px', background: '#F5F1E6', minWidth: '180px' }}><span className="metric" style={{ fontSize: '24px', lineHeight: '30px' }}>{q.metric}</span><span className="small muted strong">{q.unit}</span></div>}
                </div>
                <p className="muted measure" style={{ margin: 0 }}>{q.summary}</p>
                <div className="row g8">
                  {q.files.map((f) => (
                    <a key={f.url} className="res" href={f.url} target="_blank" rel="noopener" style={{ padding: '8px 12px' }}>{fileIcon}<span className="small strong">{f.name}</span></a>
                  ))}
                  <a className="btn btn-t btn-sm" href={`/case-studies/${q.slug}?preview=1`} target="_blank" rel="noopener">Preview as published</a>
                  <Link className="btn btn-t btn-sm" href={`/admin/case-studies/${q.id}`}>Edit</Link>
                </div>
                {!d && !isOpen && !isAsk && (
                  <div className="row g8" style={{ borderTop: '1px solid #D9D2C1', paddingTop: '14px' }}>
                    <button className="btn btn-p btn-sm" disabled={pending} onClick={() => decide(q.id, 'published')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>Approve and publish</button>
                    <button className="btn btn-s btn-sm" onClick={() => { setOpen(q.id); setAsk(null) }} aria-expanded={false}>Return with a note</button>
                    <button className="btn btn-dl btn-sm" onClick={() => { setAsk(q.id); setOpen(null) }}>Reject</button>
                  </div>
                )}
                {isOpen && (
                  <div className="stack g8" style={{ padding: '14px', borderRadius: '12px', background: '#FBEFD5' }}>
                    <label className="lbl" htmlFor={`note-${q.id}`}>Note to {q.by}</label>
                    <textarea className="inp" id={`note-${q.id}`} style={{ minHeight: '96px' }} placeholder="What should they add or change before resubmitting?" value={notes[q.id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}></textarea>
                    {error[q.id] && <span className="emsg" role="alert">{error[q.id]}</span>}
                    <div className="row g8"><button className="btn btn-p btn-sm" disabled={pending} onClick={() => decide(q.id, 'returned')}>Send and return</button><button className="btn btn-t btn-sm" onClick={() => setOpen(null)}>Cancel</button></div>
                  </div>
                )}
                {isAsk && (
                  <div className="row between g12" role="alert" style={{ padding: '14px', borderRadius: '12px', background: '#FBE4E1' }}>
                    <span>Reject “{q.title}”? {q.by} will be told it won’t be published.</span>
                    <div className="row g8"><button className="btn btn-danger btn-sm" disabled={pending} onClick={() => decide(q.id, 'rejected')}>Reject</button><button className="btn btn-t btn-sm" onClick={() => setAsk(null)}>Cancel</button></div>
                  </div>
                )}
                {!isOpen && error[q.id] && <span className="emsg" role="alert">{error[q.id]}</span>}
                {d && (
                  <div className="row between g12" role="status" style={{ paddingTop: '14px', borderTop: '1px solid #D9D2C1' }}>
                    <span className="row g8"><span className={decCls}>{decLabel}</span><span className="small muted">{decText}</span></span>
                    <button className="btn btn-t btn-sm" disabled={pending} onClick={() => undo(q.id)}>Undo</button>
                  </div>
                )}
              </article>
            )
          })}
          {queue.length === 0 && (
            <div className="card empty">
              <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></span>
              <h2 className="h4" style={{ margin: 0 }}>You’re all caught up</h2>
              <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>New case study submissions from members will wait here for your approval.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'p' && (
        <div className="card" role="tabpanel" style={{ overflowX: 'auto' }}>
          {published.length > 0 && (
            <table className="atbl m">
              <caption className="sr">Published case studies</caption>
              <thead><tr><th scope="col">Case study</th><th scope="col">Category</th><th scope="col">Region</th><th scope="col">Impact</th><th scope="col">Published</th><th scope="col"><span className="sr">Actions</span></th></tr></thead>
              <tbody>
                {published.map((p) => (
                  <tr key={p.id}><td><span className="stack"><strong>{p.title}</strong><span className="small muted">{p.org}</span></span></td><td data-l="Category" className="small">{p.cat}</td><td data-l="Region" className="small">{p.region}</td><td data-l="Impact" className="small strong">{p.impact}</td><td data-l="Published" className="small">{p.when}</td><td><div className="acts"><a className="btn btn-g" href={`/case-studies/${p.slug}`} target="_blank" rel="noopener">View</a><Link className="btn btn-g" href={`/admin/case-studies/${p.id}`}>Edit</Link><button className="btn btn-g" disabled={pending} onClick={() => unpublish(p.id)}>Unpublish</button></div></td></tr>
                ))}
              </tbody>
            </table>
          )}
          {published.length === 0 && <div className="empty"><h2 className="h4" style={{ margin: 0 }}>Nothing published yet</h2><p className="muted" style={{ margin: 0 }}>Approved case studies appear here and on the website.</p></div>}
        </div>
      )}

      {tab === 'o' && (
        <div className="card" role="tabpanel" style={{ overflowX: 'auto' }}>
          {other.length > 0 && (
            <table className="atbl m">
              <caption className="sr">Draft, returned and rejected case studies</caption>
              <thead><tr><th scope="col">Case study</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Last changed</th><th scope="col"><span className="sr">Actions</span></th></tr></thead>
              <tbody>
                {other.map((o) => (
                  <tr key={o.id}>
                    <td><span className="stack"><strong>{o.title}</strong><span className="small muted">{o.org}</span></span></td><td data-l="Category" className="small">{o.cat}</td><td data-l="Status"><span className={o.statusCls}>{o.status}</span></td><td data-l="Last changed" className="small">{o.when}</td>
                    <td>
                      {askDelete === o.id ? (
                        <div className="acts"><button className="btn btn-danger" disabled={pending} onClick={() => remove(o.id)}>Delete</button><button className="btn btn-g" onClick={() => setAskDelete(null)}>Cancel</button></div>
                      ) : (
                        <div className="acts"><Link className="btn btn-g" href={`/admin/case-studies/${o.id}`}>Edit</Link><button className="btn btn-dl" onClick={() => setAskDelete(o.id)}>Delete</button></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {other.length === 0 && <div className="empty"><h2 className="h4" style={{ margin: 0 }}>No drafts</h2><p className="muted" style={{ margin: 0, maxWidth: '460px' }}>Case studies you write here, and submissions you return or reject, are kept in this list.</p><Link className="btn btn-s" href="/admin/case-studies/new">Add case study</Link></div>}
        </div>
      )}
    </>
  )
}
