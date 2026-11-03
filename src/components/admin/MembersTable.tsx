'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { setBlockedAction } from '@/app/(frontend)/admin/members/actions'
import { useQueryState } from './AdminFilters'
import { RemoveMemberDialog } from './RemoveMemberDialog'

export type MemberTableRow = {
  id: number
  name: string
  email: string
  org: string
  country: string
  tier: string
  tierCls: string
  joined: string
  last: string
  online: boolean
  blocked: boolean
  top: string
  time: string
  courses: string
}

// Table, sorting, block and remove from AdminMembers.dc.html. Sorting and paging live in the URL.
export function MembersTable({
  rows,
  sortKey,
  dir,
  shown,
  total,
  page,
  pages,
}: {
  rows: MemberTableRow[]
  sortKey: string
  dir: 'asc' | 'desc'
  shown: number
  total: number
  page: number
  pages: number
}) {
  const router = useRouter()
  const { set } = useQueryState()
  const [confirm, setConfirm] = useState<MemberTableRow | null>(null)
  const [pending, start] = useTransition()
  const sortBy = (k: string) => () => set({ sort: k, dir: sortKey === k && dir === 'asc' ? 'desc' : 'asc' })
  const ar = (k: string) => (sortKey === k ? (dir === 'asc' ? '▲' : '▼') : '↕')
  const so = (k: string) => (sortKey === k ? (dir === 'asc' ? 'ascending' : 'descending') : 'none') as React.AriaAttributes['aria-sort']
  const toggleBlock = (r: MemberTableRow) => {
    if (!r.blocked && !window.confirm(`Block ${r.name}? They won’t be able to log in until you unblock them.`)) return
    start(async () => {
      await setBlockedAction(r.id, !r.blocked)
      router.refresh()
    })
  }

  return (
    <>
      <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
        <table className="atbl m" style={{ minWidth: '1080px' }}>
          <caption className="sr">Members. Column headers with buttons can be sorted.</caption>
          <thead><tr>
            <th scope="col" aria-sort={so('name')}><button onClick={sortBy('name')}>Member {ar('name')}</button></th>
            <th scope="col">Organization · country</th>
            <th scope="col">Tier</th>
            <th scope="col" aria-sort={so('joined')}><button onClick={sortBy('joined')}>Joined {ar('joined')}</button></th>
            <th scope="col" aria-sort={so('last')}><button onClick={sortBy('last')}>Last login {ar('last')}</button></th>
            <th scope="col">Status</th>
            <th scope="col">Most viewed</th>
            <th scope="col" aria-sort={so('time')}><button onClick={sortBy('time')}>Time on site {ar('time')}</button></th>
            <th scope="col" aria-sort={so('courses')}><button onClick={sortBy('courses')}>Courses {ar('courses')}</button></th>
            <th scope="col"><span className="sr">Actions</span></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.blocked ? 'blocked' : ''}>
                <td><Link href={`/admin/members/${r.id}`} className="stack" style={{ textDecoration: 'none', color: '#17323A' }}><strong>{r.name}</strong><span className="small muted">{r.email}</span></Link></td>
                <td data-l="Organization"><span className="stack"><span>{r.org || '—'}</span><span className="small muted">{r.country}</span></span></td>
                <td data-l="Tier"><span className={r.tierCls}>{r.tier}</span></td>
                <td data-l="Joined" className="small">{r.joined}</td>
                <td data-l="Last login" className="small">{r.last}</td>
                <td data-l="Status"><span className="row nowrap g8 small strong"><span className={r.blocked ? 'dot blk' : r.online ? 'dot' : 'dot off'}></span>{r.blocked ? 'Blocked' : r.online ? 'Online' : 'Offline'}</span></td>
                <td data-l="Most viewed" className="small">{r.top}</td>
                <td data-l="Time on site" className="small strong" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.time}</td>
                <td data-l="Courses completed" className="small strong">{r.courses}</td>
                <td>
                  <div className="acts">
                    <Link className="btn btn-g" href={`/admin/members/${r.id}`} aria-label={`View ${r.name}`}>View</Link>
                    <button className="btn btn-g" onClick={() => toggleBlock(r)} disabled={pending} aria-label={`${r.blocked ? 'Unblock' : 'Block'} ${r.name}`}>{r.blocked ? 'Unblock' : 'Block'}</button>
                    <button className="btn btn-dl" onClick={() => setConfirm(r)} aria-label={`Remove ${r.name}`}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row between g12 small muted"><span>Showing {shown} of {total} members</span><div className="row g8"><button className="btn btn-g btn-sm" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>Previous</button><button className="btn btn-g btn-sm" disabled={page >= pages} onClick={() => set({ page: String(page + 1) })}>Next</button></div></div>
      {confirm && (
        <RemoveMemberDialog
          id={confirm.id}
          name={confirm.name}
          onCancel={() => setConfirm(null)}
          onRemoved={(name) => {
            setConfirm(null)
            set({ removed: name })
            router.refresh()
          }}
        />
      )}
    </>
  )
}
