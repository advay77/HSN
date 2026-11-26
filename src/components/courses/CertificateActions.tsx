'use client'

import React from 'react'

import { DownloadCertificatePdf } from '@/components/certificates/DownloadCertificatePdf'

// Buttons above the certificate; hidden when printing.
export function CertificateActions({ linkedIn, fileName }: { linkedIn: string; fileName: string }) {
  return (
    <div className="cert-actions row g12">
      <a className="btn btn-s" href="/my">Back to My HSN</a>
      <span className="row g12" style={{ flexWrap: 'wrap' }}>
        <a className="btn btn-s" href={linkedIn} target="_blank" rel="noopener">Add to LinkedIn</a>
        <DownloadCertificatePdf fileName={fileName} />
      </span>
    </div>
  )
}
