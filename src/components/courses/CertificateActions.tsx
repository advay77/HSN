'use client'

import React from 'react'

// Buttons above the certificate; hidden when printing.
export function CertificateActions({ linkedIn, feedbackHref }: { linkedIn: string; feedbackHref: string }) {
  return (
    <div className="cert-actions row g12">
      <a className="btn btn-s" href="/my">Back to My HSN</a>
      <a className="btn btn-s" href={feedbackHref}>Share feedback</a>
      <span className="row g12" style={{ flexWrap: 'wrap' }}>
        <a className="btn btn-s" href={linkedIn} target="_blank" rel="noopener">Add to LinkedIn</a>
        <button className="btn btn-p" onClick={() => window.print()}>Download PDF</button>
      </span>
      <p className="small muted cert-tip">Tip: in the print window choose “Save as PDF”, landscape.</p>
    </div>
  )
}
