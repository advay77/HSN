import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-editor.css'

import { CASE_CATEGORIES, CASE_REGIONS } from '@/collections/CaseStudies'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { CaseEditor } from '@/components/admin/cases/CaseEditor'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import { attachmentsOf, currentFile, toForm } from '../editor-data'

export const metadata = { title: 'Edit case study' }

const STATUS: Record<string, [string, string]> = {
  draft: ['Draft', 'bdg b-reg'],
  submitted: ['Waiting for approval', 'bdg b-warn'],
  published: ['Published', 'bdg b-ok'],
  returned: ['Returned', 'bdg b-err'],
  rejected: ['Rejected', 'bdg b-reg'],
}

export default async function EditCaseStudyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params
  const admin = await requireAdmin(`/admin/case-studies/${id}`)
  const num = Number(id)
  if (!Number.isInteger(num)) notFound()
  const payload = await getPayloadClient()
  const cs = await payload.findByID({ collection: 'case-studies', id: num, depth: 1 }).catch(() => null)
  if (!cs) notFound()
  const [label, cls] = STATUS[cs.status] ?? [cs.status, 'bdg b-reg']
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/case-studies">Case studies</Link><span aria-hidden="true">/</span><span aria-current="page">{cs.title}</span></nav><span className={cls} style={{ height: '22px', alignSelf: 'flex-start' }}>{label}</span></div>}
      />
      <main className="amain">
        <CaseEditor
          id={num}
          initial={toForm(cs)}
          categories={CASE_CATEGORIES}
          regions={CASE_REGIONS}
          currentImage={currentFile(cs.image)}
          currentPdf={currentFile(cs.pdf)}
          attachments={attachmentsOf(cs)}
          publishedAt={cs.publishedAt ?? null}
          saved={(await searchParams).saved === '1'}
        />
      </main>
    </>
  )
}
