// Library admin. No design board, so it follows the admin boards: .atop bar, .atbl table like
// AdminRegistrations.dc.html, and the AdminEmpty.dc.html empty state.
import Link from 'next/link'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { LibraryTable, type LibraryRow } from '@/components/admin/library/LibraryTable'
import { requireAdmin } from '@/lib/admin/auth'
import { dayLabel } from '@/lib/admin/format'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Library' }

export default async function AdminLibraryPage() {
  const admin = await requireAdmin('/admin/library')
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'library-resources', sort: '-updatedAt', pagination: false, depth: 1 })
  const rows: LibraryRow[] = res.docs.map((r) => {
    const file = r.file && typeof r.file === 'object' ? r.file : null
    return {
      id: Number(r.id),
      title: r.title,
      description: r.description,
      type: r.type,
      access: r.access === 'members' ? 'Members' : 'Free',
      source: file?.url ? { label: file.filename || 'File', url: `/admin/files/${file.id}` } : r.externalUrl ? { label: 'Link', url: r.externalUrl } : null,
      details: [r.format, r.size].filter(Boolean).join(' · '),
      published: !!r.published,
      when: dayLabel(r.updatedAt),
    }
  })
  const live = rows.filter((r) => r.published).length
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Library</h1><span className="small muted">{rows.length ? `${rows.length} ${rows.length === 1 ? 'resource' : 'resources'} · ${live} on the website` : 'Guides, toolkits, reports and templates for the Library page'}</span></div>}
        actions={<Link className="btn btn-p btn-sm" href="/admin/library/new"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Add resource</Link>}
      />
      <main className="amain">
        <LibraryTable rows={rows} />
      </main>
    </>
  )
}
