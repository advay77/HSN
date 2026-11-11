import React from 'react'

import { CertificateFit } from './CertificateFit'

// The certificate itself: an A4 landscape sheet that scales with its width, so the screen view,
// the phone view and the printed PDF all have the same layout.

type Props = {
  name: string
  course: string
  issued: string
  id: string
  verifyUrl: string
  /** SVG markup of the QR code that opens verifyUrl. */
  qr: string
  issuer: string
}

// Fine wavy lines behind the text, like the security pattern on printed certificates.
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

export function CertificateSheet({ name, course, issued, id, qr, issuer }: Props) {
  return (
    <CertificateFit label={`Certificate of completion: ${course}, awarded to ${name}`}>
      {/* Classic certificate type and the script for the digital signature (React loads it once). */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Great+Vibes&family=Playfair+Display:wght@600;700&display=swap" precedence="default" />
      <div className="cert-sheet">
        <aside className="cert-side">
          <img className="cert-tree" src="/images/certificate/hsn-tree.png" alt="" aria-hidden="true" />
          <span className="cert-date">
            <b>{issued}</b>
            <span>Date of award</span>
          </span>
        </aside>
        <section className="cert-main">
          <Guilloche />
          <img className="cert-logo" src="/images/certificate/hsn-logo-full.png" alt={issuer} />
          <span className="cert-k">Certificate of Completion</span>
          <span className="cert-pre">This is to certify that</span>
          <span className="cert-name">{name}</span>
          <span className="cert-s">has successfully completed the course</span>
          <span className="cert-c">{course}</span>
          <div className="cert-foot">
            <div className="cert-ver">
              <span className="cert-qr" dangerouslySetInnerHTML={{ __html: qr }} />
              <span className="cert-ver-t">
                <span>Scan the code to verify this certificate</span>
                <span>Certificate ID</span>
                <b>{id}</b>
              </span>
            </div>
            <div className="cert-sign">
              {/* Digital signature: the full name in script (HSN request); the printed name below it was removed. */}
              <span className="cert-sig">Dr. Nishant Jaiswal</span>
              <span>Founder<br />{issuer}</span>
            </div>
          </div>
        </section>
      </div>
    </CertificateFit>
  )
}
