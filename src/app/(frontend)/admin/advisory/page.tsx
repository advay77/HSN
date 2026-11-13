// Admin → Advisory Board: the advisors shown on /advisory (photo, name, role, profile, order, show or hide).
import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-courses.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdvisoryAdmin, type AdvisorRow } from '@/components/admin/AdvisoryAdmin'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: 'Advisory Board' }
export const dynamic = 'force-dynamic'

export default async function AdminAdvisoryPage() {
  const admin = await requireAdmin('/admin/advisory')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'advisors', sort: 'sort', pagination: false, depth: 1 })
  const rows: AdvisorRow[] = docs.map((a) => {
    const photo = a.photo && typeof a.photo === 'object' ? a.photo : null
    return {
      id: a.id,
      name: a.name,
      role: a.role || '',
      badge: a.badge || 'Advisor',
      bio: a.bio || '',
      photoUrl: photo?.url || a.photoPath || null,
      photoId: photo?.id ?? null,
      hasPhotoPath: !photo && !!a.photoPath,
      published: a.published !== false,
    }
  })
  const live = rows.filter((r) => r.published).length
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Advisory Board</h1><span className="small muted">{rows.length} {rows.length === 1 ? 'advisor' : 'advisors'} · {live} on the website</span></div>}
        actions={<Link className="btn btn-s btn-sm" href="/advisory" target="_blank" rel="noopener">View page</Link>}
      />
      <main className="amain">
        <AdvisoryAdmin rows={rows} />
      </main>
    </>
  )
}
