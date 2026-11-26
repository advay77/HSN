// Resources → Webinars: every published webinar with its date, speakers and recording (YouTube or an uploaded
// video). Managed in Admin → Webinars.
import type { Metadata } from 'next'
import React from 'react'

import '../../styles/pages/webinars.css'

import { youtubeId } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'
import { getSiteCopy } from '@/lib/site/copy'
import { formatWebinarDate, initialsOf } from '@/lib/webinars'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Webinars',
  description: 'Recordings of Healthcare Sustainability Network webinars with healthcare and sustainability experts.',
}
export const revalidate = 60

const mediaOf = (m: unknown) => (m && typeof m === 'object' && (m as Media).url ? (m as Media) : null)

export default async function WebinarsPage() {
  const [payload, copy] = await Promise.all([getPayloadClient(), getSiteCopy()])
  const { docs } = await payload.find({ collection: 'webinars', where: { published: { equals: true } }, sort: '-heldOn', pagination: false, depth: 1 })
  // Compared as YYYY-MM-DD text, so the day a webinar is held still counts as upcoming.
  const todayKey = new Date().toISOString().slice(0, 10)

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        <div className="wrap stack g20">
          <h1 className="sec-title">{copy.webinarsTitle}</h1>
          {copy.webinarsIntro && <p className="lead measure" style={{ margin: 0 }}>{copy.webinarsIntro}</p>}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: '8px' }}>
        <div className="wrap stack g32">
          {docs.map((w) => {
            const yt = youtubeId(w.youtubeUrl)
            const video = mediaOf(w.video)
            const upcoming = (w.heldOn || '').slice(0, 10) >= todayKey
            const anchor = `web-${w.id}`
            return (
              <article key={w.id} id={anchor} className="card web-card" aria-labelledby={`${anchor}-t`}>
                <div className="web-media">
                  {yt ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
                      title={`${w.title} (YouTube video)`}
                      loading="lazy"
                      allow="encrypted-media; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : video ? (
                    <video src={video.url!} controls preload="metadata" aria-label={`${w.title} recording`}></video>
                  ) : (
                    <div className="web-soon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m10 9 5 3-5 3z"></path></svg>
                      <span>{upcoming ? 'Recording after the webinar' : 'Recording coming soon'}</span>
                    </div>
                  )}
                </div>
                <div className="pad-l stack g16">
                  <div className="row g8" style={{ flexWrap: 'wrap' }}>
                    {upcoming && <span className="bdg b-ok">Upcoming</span>}
                    <span className="bdg b-reg">{formatWebinarDate(w.heldOn)}{w.time ? ` · ${w.time}` : ''}</span>
                  </div>
                  <h2 className="h3" id={`${anchor}-t`} style={{ margin: 0 }}>{w.title}</h2>
                  {w.summary && <div className="web-summary stack g12">{w.summary.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}</div>}
                  {(w.speakers?.length ?? 0) > 0 && (
                    <ul className="web-speakers" aria-label="Speakers">
                      {w.speakers!.map((s) => {
                        const photo = mediaOf(s.photo)
                        return (
                          <li key={s.id} className="web-speaker">
                            {photo ? <img src={photo.url!} alt="" /> : <span className="web-initials" aria-hidden="true">{initialsOf(s.name)}</span>}
                            <span className="stack">
                              <span className="small strong web-label">{s.label || 'Speaker'}</span>
                              <strong>{s.name}</strong>
                              {s.role && <span className="small muted">{s.role}</span>}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </article>
            )
          })}
          {docs.length === 0 && <p className="muted">Webinar recordings will appear here soon.</p>}
        </div>
      </section>
    </main>
  )
}
