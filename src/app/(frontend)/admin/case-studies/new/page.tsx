import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-editor.css'

import { CASE_CATEGORIES, CASE_REGIONS } from '@/collections/CaseStudies'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { CaseEditor } from '@/components/admin/cases/CaseEditor'
import { requireAdmin } from '@/lib/admin/auth'

export const metadata = { title: 'New case study' }

export default async function NewCaseStudyPage() {
  const admin = await requireAdmin('/admin/case-studies/new')
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/case-studies">Case studies</Link><span aria-hidden="true">/</span><span aria-current="page">New case study</span></nav><h1 className="h2" style={{ margin: 0 }}>New case study</h1></div>}
      />
      <main className="amain">
        <CaseEditor id={null} initial={null} categories={CASE_CATEGORIES} regions={CASE_REGIONS} currentImage={null} currentPdf={null} attachments={[]} publishedAt={null} />
      </main>
    </>
  )
}
