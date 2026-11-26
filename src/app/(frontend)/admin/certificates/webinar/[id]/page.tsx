import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/certificate.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { DeleteWebinarCertificate } from '@/components/admin/DeleteWebinarCertificate'
import { DownloadCertificatePdf } from '@/components/certificates/DownloadCertificatePdf'
import { WebinarSheet } from '@/components/certificates/WebinarSheet'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import { certificateFileName, formatCertificateNo, roleLabel, type WebinarCertificate } from '@/lib/certificates/webinar'

export const metadata = { title: 'Webinar certificate' }
export const dynamic = 'force-dynamic'

export default async function WebinarCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin(`/admin/certificates/webinar/${id}`)
  const num = Number(id)
  if (!Number.isInteger(num)) notFound()
  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'webinar-certificates', id: num, depth: 0 }).catch(() => null)
  if (!doc) notFound()
  const cert: WebinarCertificate = {
    id: doc.id,
    role: doc.role,
    recipient: doc.recipient,
    webinar: doc.webinar,
    heldOn: doc.heldOn,
    certificateNo: doc.certificateNo ?? 0,
    rightName: doc.rightName,
    rightTitle: doc.rightTitle,
  }
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/certificates">Certificates</Link><span aria-hidden="true">/</span><span aria-current="page">{cert.recipient}</span></nav><h1 className="h2" style={{ margin: 0 }}>{roleLabel(cert.role)} certificate</h1></div>}
      />
      <main className="amain wcert-page">
        <div className="cert-wrap">
          <div className="cert-actions row g12">
            <Link className="btn btn-s" href="/admin/certificates">Back to certificates</Link>
            <span className="row g12" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <DeleteWebinarCertificate id={cert.id} label={`${formatCertificateNo(cert.certificateNo, cert.heldOn)} for ${cert.recipient}`} />
              <DownloadCertificatePdf fileName={certificateFileName(formatCertificateNo(cert.certificateNo, cert.heldOn))} />
            </span>
          </div>
          <WebinarSheet cert={cert} />
        </div>
      </main>
    </>
  )
}
