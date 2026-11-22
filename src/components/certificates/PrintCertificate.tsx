'use client'

import React from 'react'

export function PrintCertificate() {
  return (
    <button className="btn btn-p" onClick={() => window.print()}>Download PDF</button>
  )
}
