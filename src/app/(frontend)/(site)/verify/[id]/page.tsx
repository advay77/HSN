// Public certificate check: employers and others can confirm an HSN certificate by its ID.
import type { Metadata } from 'next'
import React from 'react'

import { formatIssued, verifyCertificate } from '@/lib/courses/certificate'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Verify certificate', robots: { index: false } }

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cert = await verifyCertificate(decodeURIComponent(id))
  return (
    <main>
      <section className="sec">
        <div className="wrap" style={{ maxWidth: 680 }}>
          <div className="card pad stack g16">
            {cert ? (
              <>
                <span className="bdg b-ok" style={{ alignSelf: 'flex-start' }}>Valid certificate</span>
                <h1 className="h3">{cert.name}</h1>
                <p>has completed <b><a href={`/courses/${cert.slug}`}>{cert.course}</a></b>, issued by Healthcare Sustainability Network on <b>{formatIssued(cert.issued)}</b>.</p>
                <p className="small muted">Certificate ID {cert.id}</p>
              </>
            ) : (
              <>
                <span className="bdg b-err" style={{ alignSelf: 'flex-start' }}>Not found</span>
                <h1 className="h3">We could not find this certificate</h1>
                <p>Check that the certificate ID is typed exactly as printed (for example HSN-12-1A2B3C4D). For help, write to us from the Contact page.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
