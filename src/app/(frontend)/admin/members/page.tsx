// Ported from AdminMembers.dc.html (with its empty state from AdminEmpty.dc.html). Real members only.
import React from 'react'

import { ExportButton, FilterSelect, SearchBox } from '@/components/admin/AdminFilters'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { MembersTable } from '@/components/admin/MembersTable'
import { requireAdmin } from '@/lib/admin/auth'
import { findMembers, PAGE_SIZE } from '@/lib/admin/members'
import { COUNTRIES, fmtAgo, fmtDate, fmtHM, TIER_CLS, TIER_LABEL } from '@/lib/admin/people'

export const metadata = { title: 'Members' }

type SP = Promise<Record<string, string | undefined>>

export default async function AdminMembersPage({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdmin('/admin/members')
  const sp = await searchParams
  const { rows, total, online, key, dir } = await findMembers(sp)
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(sp.page) || 1), pages)
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const filtered = !!(sp.q || sp.tier || sp.country)
  const countLabel = total
    ? `${total} ${total === 1 ? 'member' : 'members'} · ${online} online now`
    : 'No members yet'

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Members</h1><span className="small muted">{countLabel}</span></div>}
        actions={total ? <ExportButton href="/admin/members/export" /> : undefined}
      />
      <main className="amain">
        {sp.removed && (
          <div className="note note-ok" role="status"><span><strong>{sp.removed}</strong>{' '}was removed from HSN.</span></div>
        )}
        <div className="row g12 between">
          <div className="fld" style={{ flex: '1 1 360px', maxWidth: '480px' }}>
            <label className="sr" htmlFor="ms">Search members</label>
            <span className="sel" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '14px', top: '14px' }}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <SearchBox id="ms" placeholder="Search by name, email, organization, country or tier" />
            </span>
          </div>
          <div className="row g8">
            <FilterSelect id="mt" name="tier" label="Tier" labelClass="sr" allLabel="All tiers" width="200px" options={Object.entries(TIER_LABEL).map(([value, label]) => ({ value, label }))} />
            <FilterSelect id="mc" name="country" label="Country" labelClass="sr" allLabel="All countries" width="180px" options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
          </div>
        </div>
        {pageRows.length > 0 ? (
          <MembersTable
            rows={pageRows.map((r) => ({
              id: r.id,
              name: r.name,
              email: r.email,
              org: r.org,
              country: r.country,
              tier: r.tier ? TIER_LABEL[r.tier]! : 'Not a member',
              tierCls: r.tier ? TIER_CLS[r.tier]! : 'bdg b-reg',
              joined: fmtDate(r.joined),
              last: fmtAgo(r.lastLoginAt),
              online: r.online,
              blocked: r.blocked,
              top: r.top,
              time: fmtHM(r.seconds),
              courses: String(r.completed),
            }))}
            sortKey={key}
            dir={dir}
            shown={pageRows.length}
            total={rows.length}
            page={page}
            pages={pages}
          />
        ) : (
          <div className="card empty">
            <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2a5 5 0 0 1 5.5 5.3"></path></svg></span>
            <h2 className="h4" style={{ margin: 0 }}>{!total ? 'No members yet' : sp.q ? `No members match “${sp.q}”` : 'No members match these filters'}</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>{!total ? 'When people sign up or join with Google, they appear here with their activity and courses.' : filtered && sp.q ? 'Check the spelling, or search by email or organization instead.' : 'Try another tier or country.'}</p>
          </div>
        )}
      </main>
    </>
  )
}
