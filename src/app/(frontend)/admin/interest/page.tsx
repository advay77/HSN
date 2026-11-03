// Ported from AdminInterest.dc.html (with its empty state from AdminEmpty.dc.html).
import React from 'react'

import { ExportButton, FilterSelect } from '@/components/admin/AdminFilters'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { findInterest } from '@/lib/admin/inbox'
import { COUNTRIES, fmtWhen, TIER_CLS, TIER_LABEL } from '@/lib/admin/people'

export const metadata = { title: 'Membership interest' }

export default async function AdminInterestPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const admin = await requireAdmin('/admin/interest')
  const sp = await searchParams
  const { total, rows, tierCounts } = await findInterest(sp)

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Membership interest</h1><span className="small muted">From the “Register interest” form</span></div>}
        actions={total ? <ExportButton href="/admin/interest/export" /> : undefined}
      />
      <main className="amain">
        <div className="grid c3" style={{ gap: '16px' }}>
          {tierCounts.map((t) => (
            <div key={t.tier} className="kpi"><span className="small strong muted">{TIER_LABEL[t.tier]}</span><span className="kpi-n">{t.n}</span></div>
          ))}
        </div>
        <div className="row g12 between">
          <div className="row g12">
            <FilterSelect wrapField id="it" name="tier" label="Tier" labelClass="small strong muted" allLabel="All tiers" width="240px" options={Object.entries(TIER_LABEL).map(([value, label]) => ({ value, label }))} />
            <FilterSelect wrapField id="ic" name="country" label="Country" labelClass="small strong muted" allLabel="All countries" width="200px" options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
          </div>
          <span className="strong" role="status">{rows.length + (rows.length === 1 ? ' entry' : ' entries')}</span>
        </div>
        {rows.length > 0 ? (
          <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
            <table className="atbl m">
              <caption className="sr">Membership interest entries</caption>
              <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Country</th><th scope="col">Tier</th><th scope="col">Submitted</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}><td><strong>{r.name}</strong></td><td data-l="Email" className="small">{r.email}</td><td data-l="Country" className="small">{r.country || '—'}</td><td data-l="Tier"><span className={TIER_CLS[r.tier] ?? 'bdg b-reg'}>{TIER_LABEL[r.tier] ?? r.tier}</span></td><td data-l="Submitted" className="small">{fmtWhen(r.createdAt)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty">
            <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"></path></svg></span>
            <h2 className="h4" style={{ margin: 0 }}>{total ? 'No entries match these filters' : 'No interest registered yet'}</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>{total ? 'Try another tier or country.' : 'When visitors use “Register interest” on the Membership page, their name, email, country and tier appear here.'}</p>
          </div>
        )}
      </main>
    </>
  )
}
