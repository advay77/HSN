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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;1,500&family=Playfair+Display:wght@600;700&display=swap" precedence="default" />
      <div className="wcert-sheet">
        <img className="wcert-logo" src="/images/certificate/hsn-logo-full.png" alt="Healthcare Sustainability Network" />
        <span className="wcert-series">Webinar series</span>
        <span className="wcert-k">Certificate of Appreciation</span>
        <span className="wcert-role">{role}</span>
        <span className="wcert-pre">This certificate is proudly presented to</span>
        <span className="wcert-name">{cert.recipient}</span>
        <p className="wcert-body">
          in sincere appreciation of your valued participation as {cert.role === 'moderator' ? <strong>Moderator</strong> : <>a <strong>Speaker</strong></>} {cert.role === 'moderator' ? 'of' : 'at'} the HSN webinar <strong>“{cert.webinar}”</strong>, held on {cert.heldOn}. {thanks}
        </p>
        <div className="wcert-signs">
          <div className="wcert-no">
            <b>{formatCertificateNo(cert.certificateNo)}</b>
            <span>Certificate No.</span>
          </div>
          <div className="wcert-sign">
            <b>{cert.rightName}</b>
            <span>{cert.rightTitle}, HSN</span>
          </div>
        </div>
        <span className="wcert-foot">HSN · {year} · healthcaresustainabilitynetwork.com</span>
      </div>
    </CertificateFit>
  )
}
