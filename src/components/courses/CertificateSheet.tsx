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

// Round seal with the HSN mark in the middle and the network name around the edge.
function Seal({ issuer }: { issuer: string }) {
  const ring = `${issuer.toUpperCase()} • CERTIFIED • `
  return (
    <svg className="cert-seal" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="cert-ring" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="#FFFFFF" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#0B6B3A" strokeWidth="4" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#4FAE4E" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="#B9D8C4" strokeWidth="1.2" />
      <text className="cert-seal-t">
        <textPath href="#cert-ring" textLength="462" lengthAdjust="spacingAndGlyphs">{ring}</textPath>
      </text>
      <image href="/images/certificate/hsn-mark.png" x="58" y="58" width="84" height="84" />
    </svg>
  )
}

export function CertificateSheet({ name, course, issued, id, verifyUrl, qr, issuer }: Props) {
  const shortUrl = verifyUrl.replace(/^https?:\/\//, '')
  return (
    <CertificateFit label={`Certificate of completion: ${course}, awarded to ${name}`}>
      <div className="cert-sheet">
        <aside className="cert-side">
          <span className="cert-ribbon" aria-hidden="true" />
          <Seal issuer={issuer} />
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
                <span>To verify, scan the code or visit</span>
                <a href={verifyUrl}>{shortUrl.replace(/\/[^/]+$/, '')}</a>
                <span>Certificate ID: <b>{id}</b></span>
              </span>
            </div>
            <div className="cert-sign">
              <span className="cert-sig" aria-hidden="true">Nishant Jaiswal</span>
              <b>Dr. Nishant Jaiswal, PhD</b>
              <span>Founder<br />{issuer}</span>
            </div>
          </div>
        </section>
      </div>
    </CertificateFit>
  )
}
