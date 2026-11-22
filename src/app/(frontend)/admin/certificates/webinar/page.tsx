import Link from 'next/link'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { WebinarCertificateForm } from '@/components/admin/WebinarCertificateForm'
import { requireAdmin } from '@/lib/admin/auth'

export const metadata = { title: 'Issue webinar certificate' }
export const dynamic = 'force-dynamic'

export default async function IssueWebinarCertificatePage() {
  const admin = await requireAdmin('/admin/certificates/webinar')
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/certificates">Certificates</Link><span aria-hidden="true">/</span><span aria-current="page">Webinar</span></nav><h1 className="h2" style={{ margin: 0 }}>Issue a certificate</h1><span className="small muted">Moderator or speaker. Course certificates are unchanged.</span></div>}
      />
      <main className="amain">
        <WebinarCertificateForm />
      </main>
    </>
  )
}
