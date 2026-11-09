import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { fmtWhen } from '@/lib/admin/people'
import { labelOf, RATINGS, RECOMMEND, SATISFACTION } from '@/lib/courses/feedback'
import { getPayloadClient } from '@/lib/payload'

import { setFeedbackOnSite } from '../actions'

export const metadata = { title: 'Feedback response' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

const text = (value?: string | null) => value?.trim() || '—'

export default async function AdminFeedbackDetailPage({ params }: Props) {
  const { id } = await params
  const admin = await requireAdmin(`/admin/feedback/${id}`)
  const payload = await getPayloadClient()
  const row = await payload.findByID({ collection: 'course-feedback', id, depth: 0 }).catch(() => null)
  if (!row) notFound()
  const completed = row.completionDate ? new Date(row.completionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={
          <div className="stack g4">
            <Link className="small" href="/admin/feedback">All feedback</Link>
            <h1 className="h2" style={{ margin: 0 }}>{row.delegateName}</h1>
            <span className="small muted">{row.email || 'No email'} · submitted {fmtWhen(row.createdAt)}</span>
          </div>
        }
      />
      <main className="amain">
        <div className="card pad row between g16" style={{ maxWidth: '820px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="stack g4">
            <span className="strong">Course page</span>
            <span className="small muted">
              {!row.sharePublicly ? 'The learner did not agree to show this feedback on the website.' : row.showOnSite ? 'Shown in “What learners say” on the course page.' : 'The learner agreed. It is not shown yet.'}
            </span>
          </div>
          {row.sharePublicly && (
            <form action={setFeedbackOnSite}>
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="show" value={row.showOnSite ? '0' : '1'} />
              <button className={row.showOnSite ? 'btn btn-s' : 'btn btn-p'} type="submit">{row.showOnSite ? 'Hide from website' : 'Show on website'}</button>
            </form>
          )}
        </div>
        <article className="card pad stack" style={{ maxWidth: '820px' }}>
          <div className="stack g4" style={{ padding: '8px 0 14px', borderBottom: '1px solid #E4EBE6' }}>
            <span className="small muted">Course</span>
            <span className="strong">{row.courseTitle}</span>
            <span className="small muted">Completed {completed}</span>
          </div>
          <div className="stack g4" style={{ padding: '14px 0', borderBottom: '1px solid #E4EBE6' }}>
            <span className="small muted">Overall satisfaction</span>
            <span className="strong">{labelOf(SATISFACTION, row.overallSatisfaction)}</span>
          </div>
          <div className="stack g4" style={{ padding: '14px 0', borderBottom: '1px solid #E4EBE6' }}>
            <span className="small muted">Would you recommend this course to a colleague or healthcare peer?</span>
            <span className="strong">{labelOf(RECOMMEND, row.recommend)}</span>
          </div>
          {RATINGS.map((item) => (
            <div className="stack g4" key={item.key} style={{ padding: '14px 0', borderBottom: '1px solid #E4EBE6' }}>
              <span className="small muted">{item.label}</span>
              <span className="strong">{row[item.key]} / 5</span>
            </div>
          ))}
          {[
            ['What was the most valuable takeaway or topic from this course?', row.takeaway],
            ['How do you plan to apply what you learned in your daily work or facility?', row.application],
            ['What additional topics or advanced modules would you like to see in the future?', row.futureTopics],
            ['Additional comments', row.comments],
          ].map(([question, answer]) => (
            <div className="stack g4" key={question} style={{ padding: '14px 0', borderBottom: '1px solid #E4EBE6' }}>
              <span className="small muted">{question}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{text(answer)}</span>
            </div>
          ))}
        </article>
      </main>
    </>
  )
}
