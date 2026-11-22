import React from 'react'

import Link from 'next/link'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { listCompletions } from '@/lib/admin/certificates'
import { requireAdmin } from '@/lib/admin/auth'
import { RestartNumbering } from '@/components/admin/RestartNumbering'
import { formatIssuedAt, nextCertificateNumber } from '@/lib/courses/certificate'
import { formatCertificateNo, roleLabel } from '@/lib/certificates/webinar'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Certificates' }
export const dynamic = 'force-dynamic'

export default async function AdminCertificatesPage() {
  const admin = await requireAdmin('/admin/certificates')
  const { rows, generated, completed } = await listCompletions()
  const next = await nextCertificateNumber()
  const payload = await getPayloadClient()
  const webinars = await payload.find({ collection: 'webinar-certificates', sort: '-createdAt', limit: 50, depth: 0 })

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={
          <div className="stack g4">
            <h1 className="h2" style={{ margin: 0 }}>Certificates</h1>
            <span className="small muted">{generated} generated · {completed} {completed === 1 ? 'course completed' : 'courses completed'}</span>
          </div>
        }
      />
      <main className="amain">
        <div className="row between g16">
          <div className="stack g4">
            <h2 className="h3" style={{ margin: 0 }}>Course certificates</h2>
            <span className="small muted">Issued when a learner finishes a course.</span>
          </div>
          <Link className="btn btn-p" href="/admin/certificates/webinar">Issue moderator or speaker certificate</Link>
        </div>
        <RestartNumbering next={next} />
        {rows.length > 0 ? (
          <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
            <table className="atbl m" style={{ minWidth: '980px' }}>
              <caption className="sr">Course completions and certificates</caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Course</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Certificate</th>
                  <th scope="col">Certificate ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.enrollmentId}>
                    <td>
                      <span className="stack">
                        <strong>{row.name}</strong>
                        <span className="small muted">{row.email || '—'}</span>
                      </span>
                    </td>
                    <td data-l="Course" className="small">{row.course}</td>
                    <td data-l="Completed" className="small" style={{ whiteSpace: 'nowrap' }}>{formatIssuedAt(row.when)}</td>
                    <td data-l="Certificate"><span className={row.generated ? 'bdg b-ok' : 'bdg b-reg'}>{row.generated ? 'Generated' : 'Not generated'}</span></td>
                    <td data-l="Certificate ID" className="small">{row.certificateId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty">
            <h2 className="h4" style={{ margin: 0 }}>No course completions yet</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>When a member finishes every lesson, their name, course, completion time, and certificate appear here.</p>
          </div>
        )}
        <div className="stack g12">
          <h2 className="h3" style={{ margin: 0 }}>Moderator and speaker certificates</h2>
          {webinars.docs.length > 0 ? (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="atbl m">
                <caption className="sr">Issued webinar certificates</caption>
                <thead><tr><th scope="col">No.</th><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Webinar</th><th scope="col">Date</th><th scope="col"><span className="sr">Open</span></th></tr></thead>
                <tbody>
                  {webinars.docs.map((doc) => (
                    <tr key={doc.id}>
                      <td data-l="No.">{doc.certificateNo ? formatCertificateNo(doc.certificateNo) : '—'}</td>
                      <td><strong>{doc.recipient}</strong></td>
                      <td data-l="Role">{roleLabel(doc.role)}</td>
                      <td data-l="Webinar" className="small">{doc.webinar}</td>
                      <td data-l="Date" className="small">{doc.heldOn}</td>
                      <td><Link className="btn btn-s btn-sm" href={`/admin/certificates/webinar/${doc.id}`}>Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>None issued yet. Course certificates stay in the list above.</p>
          )}
        </div>
      </main>
    </>
  )
}
