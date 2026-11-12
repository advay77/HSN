import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { listCompletions } from '@/lib/admin/certificates'
import { requireAdmin } from '@/lib/admin/auth'
import { RestartNumbering } from '@/components/admin/RestartNumbering'
import { formatIssuedAt, nextCertificateNumber } from '@/lib/courses/certificate'

export const metadata = { title: 'Certificates' }
export const dynamic = 'force-dynamic'

export default async function AdminCertificatesPage() {
  const admin = await requireAdmin('/admin/certificates')
  const { rows, generated, completed } = await listCompletions()
  const next = await nextCertificateNumber()

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
      </main>
    </>
  )
}
