'use client'

import React, { useEffect, useState } from 'react'

import { initialsOf } from '@/lib/webinars'

export type PublicWebinar = {
  id: number
  title: string
  date: string
  time: string
  upcoming: boolean
  summary: string
  youtube: string | null
  video: string | null
  speakers: { name: string; label: string; role: string; photo: string | null }[]
}

// One row per webinar so many fit on the page. Watch opens that webinar's video under its row (one at a time;
// a video only loads once it is opened). A link to /webinars#webinar-<id> opens that webinar directly.
export function WebinarTable({ rows }: { rows: PublicWebinar[] }) {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const m = window.location.hash.match(/^#webinar-(\d+)$/)
    if (m) setOpen(Number(m[1]))
  }, [])

  const toggle = (id: number) => {
    const next = open === id ? null : id
    setOpen(next)
    history.replaceState(null, '', next ? `#webinar-${next}` : window.location.pathname)
  }

  return (
    <div className="card web-wrap">
      <table className="tbl tbl-m web-tbl">
        <caption className="sr">Webinars, newest first</caption>
        <thead>
          <tr>
            <th scope="col" className="web-c-date">Date</th>
            <th scope="col">Webinar</th>
            <th scope="col" className="web-c-sp">Speakers</th>
            <th scope="col" className="web-c-act"><span className="sr">Recording</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => {
            const hasVideo = !!(w.youtube || w.video)
            const isOpen = open === w.id
            const panel = `webinar-${w.id}-video`
            return (
              <React.Fragment key={w.id}>
                <tr id={`webinar-${w.id}`} className={isOpen ? 'web-row on' : 'web-row'}>
                  <td className="web-c-date">
                    <span className="strong">{w.date}</span>
                    {w.time && <span className="small muted web-time">{w.time}</span>}
                    {w.upcoming && <span className="bdg b-ok web-up">Upcoming</span>}
                  </td>
                  <td><span className="web-title">{w.title}</span></td>
                  <td className="web-c-sp">
                    {w.speakers.length ? (
                      <ul className="web-names">
                        {w.speakers.map((s, i) => <li key={i}><span className="strong">{s.name}</span>{s.label && <span className="muted"> · {s.label}</span>}</li>)}
                      </ul>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="web-c-act">
                    {hasVideo ? (
                      <button type="button" className={isOpen ? 'btn btn-s btn-sm' : 'btn btn-p btn-sm'} aria-expanded={isOpen} aria-controls={panel} onClick={() => toggle(w.id)}>
                        {isOpen ? 'Close' : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>Watch</>)}
                      </button>
                    ) : (
                      <span className="small muted">{w.upcoming ? 'Recording after the webinar' : 'Recording soon'}</span>
                    )}
                  </td>
                </tr>
                {isOpen && hasVideo && (
                  <tr className="web-open">
                    <td colSpan={4} id={panel}>
                      <div className="web-panel">
                        <div className="web-player">
                          {w.youtube ? (
                            <iframe src={`https://www.youtube-nocookie.com/embed/${w.youtube}?rel=0&autoplay=1`} title={`${w.title} (YouTube video)`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
                          ) : (
                            <video src={w.video!} controls autoPlay preload="metadata" aria-label={`${w.title} recording`}></video>
                          )}
                        </div>
                        <div className="stack g16 web-about">
                          {w.summary && <div className="stack g8">{w.summary.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}</div>}
                          {w.speakers.length > 0 && (
                            <ul className="web-people" aria-label="Speakers">
                              {w.speakers.map((s, i) => (
                                <li key={i}>
                                  {s.photo ? <img src={s.photo} alt="" /> : <span className="web-initials" aria-hidden="true">{initialsOf(s.name)}</span>}
                                  <span className="stack">
                                    <span className="strong">{s.name}</span>
                                    <span className="small muted">{[s.label, s.role].filter(Boolean).join(' · ')}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {w.youtube && <a className="small strong" href={`https://www.youtube.com/watch?v=${w.youtube}`} target="_blank" rel="noopener">Open on YouTube</a>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
