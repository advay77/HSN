// Admin → Our Team: the people shown on /founder (photo, name, role, group, intro, order, show or hide).
import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-courses.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { TeamAdmin, type TeamRow } from '@/components/admin/TeamAdmin'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Our Team' }
export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const admin = await requireAdmin('/admin/team')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'team-members', sort: 'sort', pagination: false, depth: 1 })
  const rows: TeamRow[] = docs.map((m) => {
    const photo = m.photo && typeof m.photo === 'object' ? m.photo : null
    return {
      id: m.id,
      name: m.name,
      role: m.role || '',
      bio: m.bio || '',
      photoUrl: photo?.url || null,
      photoId: photo?.id ?? null,
      published: m.published !== false,
    }
  })
  const live = rows.filter((r) => r.published).length
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Our Team</h1><span className="small muted">{rows.length} {rows.length === 1 ? 'person' : 'people'} · {live} on the website</span></div>}
        actions={<Link className="btn btn-s btn-sm" href="/founder" target="_blank" rel="noopener">View page</Link>}
      />
      <main className="amain">
        <TeamAdmin rows={rows} />
      </main>
    </>
  )
}
