import Link from 'next/link'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { fmtWhen } from '@/lib/admin/people'
import { labelOf, RECOMMEND, SATISFACTION } from '@/lib/courses/feedback'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Course feedback' }
export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const admin = await requireAdmin('/admin/feedback')
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'course-feedback', sort: '-createdAt', pagination: false, depth: 0 })

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Course feedback</h1><span className="small muted">What each person wrote after finishing a course</span></div>}
      />
      <main className="amain">
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
