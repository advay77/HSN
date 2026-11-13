// Ported from AdminCases.dc.html (and its empty state in AdminEmpty.dc.html): approval queue + published list,
// plus a "Drafts & returned" tab for HSN's own drafts and decided submissions (not in the design).
import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-cases.css'

import { CaseQueue, type QueueItem, type PublishedRow, type OtherRow } from '@/components/admin/cases/CaseQueue'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { dayLabel } from '@/lib/admin/format'
import { getPayloadClient } from '@/lib/payload'
import type { CaseStudy, Media } from '@/payload-types'

export const metadata = { title: 'Case studies' }

const mediaList = (m: unknown): Media[] => (Array.isArray(m) ? m : []).filter((x): x is Media => !!x && typeof x === 'object')
const impactOf = (cs: CaseStudy) => cs.impacts?.[0]

export default async function AdminCasesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const admin = await requireAdmin('/admin/case-studies')
  const { tab } = await searchParams
  const payload = await getPayloadClient()
  const [queue, published, other] = await Promise.all([
    payload.find({ collection: 'case-studies', where: { status: { equals: 'submitted' } }, sort: 'createdAt', pagination: false, depth: 1 }),
    payload.find({ collection: 'case-studies', where: { status: { equals: 'published' } }, sort: '-publishedAt', pagination: false, depth: 0 }),
    payload.find({ collection: 'case-studies', where: { status: { in: ['draft', 'returned', 'rejected'] } }, sort: '-updatedAt', pagination: false, depth: 0 }),
  ])

  const queueItems: QueueItem[] = queue.docs.map((cs) => {
    const imp = impactOf(cs)
    const pdf = cs.pdf && typeof cs.pdf === 'object' ? [cs.pdf] : []
    return {
      id: Number(cs.id),
      slug: cs.slug || '',
      title: cs.title,
      cat: cs.category ?? '',
      region: cs.region || '',
      when: dayLabel(cs.createdAt),
      by: cs.submittedBy?.name || 'Unknown',
      email: cs.submittedBy?.email || '',
      org: cs.organization || '',
      metric: imp?.value || '',
      unit: imp?.label || '',
      summary: cs.summary,
      files: [...mediaList(cs.submittedBy?.attachments), ...pdf]
        .filter((m) => m.url)
        .map((m) => ({ name: m.filename || 'Attachment', url: `/admin/files/${m.id}` })),
    }
  })
  const publishedRows: PublishedRow[] = published.docs.map((cs) => {
    const imp = impactOf(cs)
    return {
      id: Number(cs.id),
      slug: cs.slug || '',
      title: cs.title,
      org: cs.organization || '',
      cat: cs.category ?? '',
      region: cs.region || '',
      impact: imp ? `${imp.value} ${imp.label}` : '',
      when: dayLabel(cs.publishedAt),
    }
  })
  const STATUS: Record<string, [string, string]> = {
    draft: ['Draft', 'bdg b-reg'],
    returned: ['Returned', 'bdg b-err'],
    rejected: ['Rejected', 'bdg b-reg'],
  }
  const otherRows: OtherRow[] = other.docs.map((cs) => ({
    id: Number(cs.id),
    title: cs.title,
    org: cs.organization || cs.submittedBy?.name || '',
    cat: cs.category ?? '',
    status: STATUS[cs.status]?.[0] ?? cs.status,
    statusCls: STATUS[cs.status]?.[1] ?? 'bdg b-reg',
    when: dayLabel(cs.updatedAt),
  }))

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Case studies</h1><span className="small muted">Review submissions before they appear on the website</span></div>}
        actions={<Link className="btn btn-p btn-sm" href="/admin/case-studies/new"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Add case study</Link>}
      />
      <main className="amain">
        <CaseQueue
          initialTab={tab === 'p' ? 'p' : tab === 'o' ? 'o' : 'q'}
          queue={queueItems}
          published={publishedRows}
          other={otherRows}
        />
      </main>
    </>
  )
}
