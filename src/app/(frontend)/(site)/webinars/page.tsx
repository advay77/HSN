// Resources → Webinars: one compact row per published webinar (date, title, speakers, Watch), newest first.
// Watch opens the recording (YouTube or an uploaded video) under its row. Managed in Admin → Webinars.
import type { Metadata } from 'next'
import React from 'react'

import '../../styles/pages/webinars.css'

import { WebinarTable, type PublicWebinar } from '@/components/webinars/WebinarTable'
import { youtubeId } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'
import { getSiteCopy } from '@/lib/site/copy'
import { formatWebinarDate } from '@/lib/webinars'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Webinars',
  description: 'Recordings of Healthcare Sustainability Network webinars with healthcare and sustainability experts.',
}
export const revalidate = 60

const mediaUrl = (m: unknown) => (m && typeof m === 'object' && (m as Media).url ? (m as Media).url! : null)

export default async function WebinarsPage() {
  const [payload, copy] = await Promise.all([getPayloadClient(), getSiteCopy()])
  const { docs } = await payload.find({ collection: 'webinars', where: { published: { equals: true } }, sort: '-heldOn', pagination: false, depth: 1 })
  // Compared as YYYY-MM-DD text, so the day a webinar is held still counts as upcoming.
  const todayKey = new Date().toISOString().slice(0, 10)
  const rows: PublicWebinar[] = docs.map((w) => ({
    id: w.id,
    title: w.title,
    date: formatWebinarDate(w.heldOn),
    time: w.time || '',
    upcoming: (w.heldOn || '').slice(0, 10) >= todayKey,
    summary: w.summary || '',
    youtube: youtubeId(w.youtubeUrl),
    video: mediaUrl(w.video),
    speakers: (w.speakers || []).map((s) => ({ name: s.name, label: s.label || 'Speaker', role: s.role || '', photo: mediaUrl(s.photo) })),
  }))

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        <div className="wrap">
          <h1 className="sec-title">{copy.webinarsTitle}</h1>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '8px' }}>
        <div className="wrap">
          {rows.length > 0 ? <WebinarTable rows={rows} /> : <p className="muted">Webinar recordings will appear here soon.</p>}
        </div>
      </section>
    </main>
  )
}
