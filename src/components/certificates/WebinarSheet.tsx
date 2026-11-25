import React from 'react'

import { CertificateFit } from '@/components/courses/CertificateFit'
import { formatCertificateNo, roleLabel, type WebinarCertificate } from '@/lib/certificates/webinar'

const issuer = 'Healthcare Sustainability Network'

function Guilloche() {
  const lines: string[] = []
  for (let k = 0; k < 18; k++) {
    const amp = 18 + (k % 6) * 5
    const phase = k * 0.42
    const y0 = 40 + k * 38
    let d = ''
    for (let x = 0; x <= 720; x += 12) {
      const y = y0 + Math.sin(x / 58 + phase) * amp + Math.sin(x / 23 + phase * 2) * (amp / 4)
      d += (x === 0 ? 'M' : 'L') + x + ' ' + y.toFixed(1)
    }
    lines.push(d)
  }
  return (
    <svg className="cert-gl" viewBox="0 0 720 707" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

export function WebinarSheet({ cert }: { cert: WebinarCertificate }) {
  const role = roleLabel(cert.role)
  return (
    <CertificateFit label={`Certificate of appreciation for ${cert.recipient}, ${role}`}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Playfair+Display:wght@600;700&display=swap" precedence="default" />
      <div className="cert-sheet wcert">
        <aside className="cert-side">
          <img className="cert-tree" src="/images/certificate/hsn-tree.png" alt="" aria-hidden="true" />
          <span className="wcert-no">
            <span>Certificate number</span>
            {formatCertificateNo(cert.certificateNo, cert.heldOn)}
          </span>
        </aside>
        <section className="cert-main">
          <Guilloche />
          <img className="cert-logo" src="/images/certificate/hsn-logo-full.png" alt={issuer} />
          <span className="cert-k">Certificate of Appreciation</span>
          <span className="cert-pre">This certificate is proudly presented to</span>
          <span className="cert-name">{cert.recipient}</span>
          <p className="wcert-body">
            in sincere appreciation of your valued participation {cert.role === 'moderator' ? <>as <strong>Moderator</strong> of</> : <>as a <strong>Speaker</strong> at</>} the HSN webinar <strong>“{cert.webinar}”</strong>, held on {cert.heldOn}. {cert.role === 'moderator' ? 'Thank you for guiding a thoughtful and engaging discussion, and for being part of the HSN community.' : 'Thank you for sharing practical and thoughtful insights, and for being part of the HSN community.'}
          </p>
          <div className="cert-foot">
            <span className="wcert-org">{issuer}</span>
            <div className="cert-sign">
              <span className="cert-sig">{cert.rightName}</span>
              <span className="wcert-who"><b>{cert.rightTitle}</b></span>
            </div>
          </div>
        </section>
      </div>
    </CertificateFit>
  )
}
