// Ported from AdminRegistrations.dc.html (with its empty state from AdminEmpty.dc.html).
import React from 'react'

import { ClearFiltersButton, ExportButton, FilterSelect } from '@/components/admin/AdminFilters'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { findRegistrations } from '@/lib/admin/inbox'
import { COUNTRIES, fmtWhen } from '@/lib/admin/people'

export const metadata = { title: 'Course registrations' }

export default async function AdminRegistrationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const admin = await requireAdmin('/admin/registrations')
  const sp = await searchParams
  const { total, rows, sessions } = await findRegistrations(sp)
  const filtered = !!(sp.session || sp.country)

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Course registrations</h1><span className="small muted">From the course registration form</span></div>}
        actions={total ? <ExportButton href="/admin/registrations/export" /> : undefined}
      />
      <main className="amain">
        <div className="row g12 between">
          <div className="row g12">
            <FilterSelect wrapField id="rs" name="session" label="Session" labelClass="small strong muted" allLabel="All sessions" width="260px" options={sessions} />
            <FilterSelect wrapField id="rc" name="country" label="Country" labelClass="small strong muted" allLabel="All countries" width="200px" options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
          </div>
          <span className="strong" role="status">{rows.length + (rows.length === 1 ? ' registration' : ' registrations')}</span>
        </div>
        {rows.length > 0 ? (
          <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
            <table className="atbl m" style={{ minWidth: '1080px' }}>
              <caption className="sr">Course registrations</caption>
              <thead><tr><th scope="col">Name</th><th scope="col">Phone</th><th scope="col">Job title / role</th><th scope="col">Organization</th><th scope="col">Country</th><th scope="col">Session</th><th scope="col">Network</th><th scope="col">Submitted</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}><td><span className="stack"><strong>{r.name}</strong><span className="small muted">{r.email}</span></span></td><td data-l="Phone" className="small" style={{ whiteSpace: 'nowrap' }}>{r.phone || '—'}</td><td data-l="Role" className="small">{r.role || '—'}</td><td data-l="Organization" className="small">{r.org || '—'}</td><td data-l="Country" className="small">{r.country || '—'}</td><td data-l="Session" className="small">{r.label}</td><td data-l="Network"><span className={r.net ? 'bdg b-ok' : 'bdg b-reg'}>{r.net ? 'Yes' : 'No'}</span></td><td data-l="Submitted" className="small">{fmtWhen(r.createdAt)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty">
            <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4M16 2v4M3 10h18"></path></svg></span>
            <h2 className="h4" style={{ margin: 0 }}>{total ? 'No registrations match these filters' : 'No registrations yet'}</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>{total ? 'Try another session or country.' : 'Entries from the course registration form appear here as soon as someone submits it.'}</p>
            {total > 0 && filtered && <ClearFiltersButton />}
          </div>
        )}
      </main>
    </>
  )
}
