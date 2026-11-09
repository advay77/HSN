import Link from 'next/link'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { fmtWhen } from '@/lib/admin/people'
import { labelOf, RECOMMEND, SATISFACTION } from '@/lib/courses/feedback'
import { getPayloadClient } from '@/lib/payload'

import { updateSiteFeedback } from './actions'

const SITE_RATING: Record<string, string> = { '5': 'Excellent', '4': 'Good', '3': 'Okay', '2': 'Poor', '1': 'Very poor' }

export const metadata = { title: 'Feedback' }
export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const admin = await requireAdmin('/admin/feedback')
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'course-feedback', sort: '-createdAt', pagination: false, depth: 0 })
  const site = await payload.find({ collection: 'site-feedback', sort: '-createdAt', pagination: false, depth: 0 })
  const unread = site.docs.filter((d) => !d.read).length

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Feedback</h1><span className="small muted">Website feedback from the public pages, and course feedback after a course</span></div>}
      />
      <main className="amain">
        <section className="stack g12" aria-labelledby="wf">
          <div className="row g12" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 className="h3" id="wf" style={{ margin: 0 }}>Website feedback</h2>
            <span className="small muted">{site.docs.length === 1 ? '1 message' : `${site.docs.length} messages`}{unread ? ` · ${unread} new` : ''}</span>
          </div>
          {site.docs.length > 0 ? (
            <div className="stack g12">
              {site.docs.map((row) => (
                <article key={row.id} className="card pad stack g8" style={row.read ? undefined : { borderColor: '#4FAE4E', boxShadow: 'inset 4px 0 0 #4FAE4E' }}>
                  <div className="row between g12" style={{ flexWrap: 'wrap' }}>
                    <span className="row g8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                      {!row.read && <span className="bdg b-ok">New</span>}
                      <strong>{row.name || 'Anonymous'}</strong>
                      {row.email && <a className="small" href={`mailto:${row.email}`}>{row.email}</a>}
                      {row.rating && <span className="bdg b-reg">{SITE_RATING[row.rating] ?? row.rating}</span>}
                    </span>
                    <span className="small muted">{fmtWhen(row.createdAt)}{row.page ? ` · from ${row.page}` : ''}</span>
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{row.message}</p>
                  <div className="row g8">
                    <form action={updateSiteFeedback}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="op" value={row.read ? 'unread' : 'read'} /><button className="btn btn-s btn-sm" type="submit">{row.read ? 'Mark as new' : 'Mark as read'}</button></form>
                    <form action={updateSiteFeedback}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="op" value="delete" /><button className="btn btn-t btn-sm" type="submit" aria-label={`Delete feedback from ${row.name || 'anonymous'}`}>Delete</button></form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card empty"><p className="muted" style={{ margin: 0 }}>No website feedback yet. Messages from the feedback form on Home, About and the Feedback page appear here.</p></div>
          )}
        </section>
        <h2 className="h3" style={{ margin: '24px 0 0' }}>Course feedback</h2>
        <span className="strong" role="status">{all.docs.length === 1 ? '1 response' : `${all.docs.length} responses`}</span>
        {all.docs.length > 0 ? (
          <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
            <table className="atbl m" style={{ minWidth: '960px' }}>
              <caption className="sr">Course completion feedback</caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Course</th>
                  <th scope="col">Overall</th>
                  <th scope="col">Recommend</th>
                  <th scope="col">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {all.docs.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="stack">
                        <Link href={`/admin/feedback/${row.id}`}><strong>{row.delegateName}</strong></Link>
                        <span className="small muted">{row.email || '—'}</span>
                      </span>
                    </td>
                    <td data-l="Course" className="small">{row.courseTitle}</td>
                    <td data-l="Overall" className="small">{labelOf(SATISFACTION, row.overallSatisfaction)}</td>
                    <td data-l="Recommend" className="small">{labelOf(RECOMMEND, row.recommend)}</td>
                    <td data-l="Submitted" className="small">{fmtWhen(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty">
            <h2 className="h4" style={{ margin: 0 }}>No feedback yet</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>Responses appear here when someone finishes a course and submits the delegate feedback form.</p>
          </div>
        )}
      </main>
    </>
  )
}
