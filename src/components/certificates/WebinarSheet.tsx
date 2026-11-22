import React from 'react'

import { CertificateFit } from '@/components/courses/CertificateFit'
import { certificateYear, formatCertificateNo, roleLabel, type WebinarCertificate } from '@/lib/certificates/webinar'

export function WebinarSheet({ cert }: { cert: WebinarCertificate }) {
  const role = roleLabel(cert.role)
  const year = certificateYear(cert.heldOn)
  const thanks = cert.role === 'moderator'
    ? 'Thank you for guiding a thoughtful and engaging discussion, and for being part of the HSN family.'
    : 'Thank you for sharing practical and thoughtful insights, and for being part of the HSN family.'
  return (
    <CertificateFit label={`Certificate of appreciation for ${cert.recipient}, ${role}`}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" precedence="default" />
      <div className="wcert-sheet">
        <div className="wcert-brand">
          <span className="wcert-mark" aria-hidden="true">HSN</span>
          <span className="wcert-brand-t">
            <span className="wcert-org">Healthcare Sustainability Network</span>
            <span className="wcert-series">Webinar series</span>
          </span>
        </div>
        <h2 className="wcert-k">Certificate of Appreciation</h2>
        <span className="wcert-pill">{role}</span>
        <span className="wcert-pre">This certificate is proudly presented to</span>
        <span className="wcert-name">{cert.recipient}</span>
        <p className="wcert-body">
          in sincere appreciation of your valued participation as {cert.role === 'moderator' ? <strong>Moderator</strong> : <>a <strong>Speaker</strong></>} {cert.role === 'moderator' ? 'of' : 'at'} the HSN webinar <strong>“{cert.webinar}”</strong>, held on {cert.heldOn}. {thanks}
        </p>
        <div className="wcert-foot">
          <div className="wcert-no">
            <span>Certificate No.</span>
            <b>{formatCertificateNo(cert.certificateNo)}</b>
          </div>
          <div className="wcert-seal-wrap">
            <span className="wcert-seal"><span>HSN</span><span>{year}</span></span>
            <span className="wcert-url">healthcaresustainabilitynetwork.com</span>
          </div>
          <div className="wcert-sign">
            <b>{cert.rightName}</b>
            <span>{cert.rightTitle}, HSN</span>
          </div>
        </div>
      </div>
    </CertificateFit>
  )
}
