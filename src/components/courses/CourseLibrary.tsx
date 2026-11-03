'use client'

// "All Courses" section of Courses.dc.html: level filter, search and the card grid.
import React, { useState } from 'react'

export type CourseCard = {
  slug: string
  title: string
  description: string
  level: string
  kind: string
  color: string
  duration: string
  meta: string
  cta: string
}

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const LEVEL_CLS: Record<string, string> = { Beginner: 'bdg b-beg', Intermediate: 'bdg b-int', Advanced: 'bdg b-adv' }

export function CourseLibrary({ courses: all }: { courses: CourseCard[] }) {
  const [lv, setLv] = useState('All')
  const [q, setQ] = useState('')
  const ql = q.trim().toLowerCase()
  const shown = all.filter((c) => (lv === 'All' || c.level === lv) && (!ql || `${c.title} ${c.description}`.toLowerCase().includes(ql)))
  const levels = LEVELS.map((n) => ({
    label: n === 'All' ? 'All levels' : n,
    count: String(n === 'All' ? all.length : all.filter((c) => c.level === n).length),
    on: lv === n,
    cls: lv === n ? 'chp on' : 'chp',
    pick: () => setLv(n),
  }))
  const noCourses = all.length === 0

  return (
    <section className="sec" style={{ paddingTop: '56px' }} aria-labelledby="lib">
      <div className="wrap stack g32">
        <div className="stack g20">
          <div className="row between g16">
            <h2 className="h2" id="lib">All Courses</h2>
            <span className="small muted" role="status">Showing {shown.length} of {all.length} {all.length === 1 ? 'course' : 'courses'}</span>
          </div>
          {!noCourses && (
            <div className="row g16 between">
              <div className="row g8 scrollx" role="group" aria-label="Filter by level">
                {levels.map((l) => (
                  <button key={l.label} className={l.cls} aria-pressed={l.on} onClick={l.pick}>
                    {l.on && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>)}{' '}{l.label}{' '}<span className="cnt">{l.count}</span>
                  </button>
                ))}
              </div>
              <div className="fld" style={{ flex: '0 1 360px', minWidth: '240px' }}>
                <label className="sr" htmlFor="cs">Search courses</label>
                <span className="sel" style={{ position: 'relative' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '14px', top: '14px' }}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                  <input className="inp" id="cs" type="search" placeholder="Search courses" style={{ paddingInlineStart: '44px' }} value={q} onChange={(e) => setQ(e.target.value)} />
                </span>
              </div>
            </div>
          )}
        </div>
        {shown.length > 0 && (
          <div className="grid c3">
            {shown.map((c) => (
              <a key={c.slug} className="card card-link" href={`/courses/${c.slug}`}>
                <div className="media" style={{ height: '120px', background: c.color }}>
                  <span className="bdg b-reg" style={{ background: '#FFFDF8' }}>{c.kind}</span>
                </div>
                <div className="pad stack g12" style={{ paddingTop: '20px', flex: '1' }}>
                  <div className="row g8"><span className={LEVEL_CLS[c.level] ?? 'bdg b-beg'}>{c.level}</span></div>
                  <h3 className="h4">{c.title}</h3>
                  <div className="row g16 small muted strong">
                    {c.duration && (
                      <span className="row g4"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>{c.duration}</span>
                    )}
                    <span>{c.meta}</span>
                  </div>
                  <span className="btn btn-s btn-sm self-start" style={{ marginTop: 'auto' }}>{c.cta}</span>
                </div>
              </a>
            ))}
          </div>
        )}
        {noCourses && (
          <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
            <h3 className="h4">No courses yet</h3>
            <p className="muted">New courses are added regularly. Join the community to hear first.</p>
          </div>
        )}
        {!noCourses && shown.length === 0 && (
          <div className="card pad-l stack g12" style={{ alignItems: 'center', textAlign: 'center' }}>
            <h3 className="h4">{ql ? 'No courses match your search' : 'No courses at this level yet'}</h3>
            <p className="muted">New cohorts are added regularly. Join the community to hear first.</p>
            <button className="btn btn-s" onClick={() => { setLv('All'); setQ('') }}>Show all levels</button>
          </div>
        )}
      </div>
    </section>
  )
}
