// Admin → Webinars: the webinars shown on /webinars (title, date, speakers, YouTube link or uploaded video).
import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-courses.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { WebinarAdmin, type WebinarRow } from '@/components/admin/WebinarAdmin'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const metadata = { title: 'Webinars' }
export const dynamic = 'force-dynamic'

const mediaOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media) : null)

export default async function AdminWebinarsPage() {
  const admin = await requireAdmin('/admin/webinars')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'webinars', sort: '-heldOn', pagination: false, depth: 1 })
  const rows: WebinarRow[] = docs.map((w) => {
    const video = mediaOf(w.video)
    return {
      id: w.id,
      title: w.title,
      date: (w.heldOn || '').slice(0, 10),
      time: w.time || '',
      summary: w.summary || '',
      youtubeUrl: w.youtubeUrl || '',
      videoId: video?.id ?? null,
      videoName: video ? video.filename || 'Uploaded video' : null,
      speakers: (w.speakers || []).map((s) => {
        const photo = mediaOf(s.photo)
        return { name: s.name, role: s.role || '', label: s.label || 'Speaker', photoId: photo?.id ?? null, photoUrl: photo?.url ?? null }
      }),
      published: w.published !== false,
    }
  })
  const live = rows.filter((r) => r.published).length
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Webinars</h1><span className="small muted">{rows.length} {rows.length === 1 ? 'webinar' : 'webinars'} · {live} on the website</span></div>}
        actions={<Link className="btn btn-s btn-sm" href="/webinars" target="_blank" rel="noopener">View page</Link>}
      />
      <main className="amain">
        <WebinarAdmin rows={rows} />
      </main>
    </>
  )
}
