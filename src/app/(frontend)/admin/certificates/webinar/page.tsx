import Link from 'next/link'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { WebinarCertificateForm } from '@/components/admin/WebinarCertificateForm'
import { requireAdmin } from '@/lib/admin/auth'
import { formatCertificateNo } from '@/lib/certificates/webinar'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Issue webinar certificate' }
export const dynamic = 'force-dynamic'

export default async function IssueWebinarCertificatePage() {
  const admin = await requireAdmin('/admin/certificates/webinar')
  const payload = await getPayloadClient()
  const top = await payload.find({ collection: 'webinar-certificates', where: { certificateNo: { greater_than: 0 } }, sort: '-certificateNo', limit: 1, depth: 0 })
  const nextNo = formatCertificateNo((top.docs[0]?.certificateNo ?? 0) + 1)
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/certificates">Certificates</Link><span aria-hidden="true">/</span><span aria-current="page">Webinar</span></nav><h1 className="h2" style={{ margin: 0 }}>Issue a certificate</h1><span className="small muted">Moderator or speaker. Course certificates are unchanged.</span></div>}
      />
      <main className="amain">
        <WebinarCertificateForm nextNo={nextNo} />
      </main>
    </>
  )
}
