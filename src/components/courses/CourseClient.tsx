'use client'

// Interactive parts of Course.dc.html: "Save for later" and the module accordion.
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { toggleSaveCourse } from '@/lib/courses/actions'

export function SaveButton({ courseId, initial, signedIn, loginHref }: { courseId: number; initial: boolean; signedIn: boolean; loginHref: string }) {
  const router = useRouter()
  const [saved, setSaved] = useState(initial)
  const [pending, start] = useTransition()
  const toggle = () => {
    if (!signedIn) return router.push(loginHref)
    setSaved(!saved)
    start(async () => {
      try {
        setSaved(await toggleSaveCourse(courseId))
      } catch {
        setSaved(saved)
      }
    })
  }
  return (
    <button className="btn btn-s btn-lg" aria-pressed={saved} aria-busy={pending} onClick={toggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"></path></svg>{saved ? 'Saved' : 'Save for later'}
    </button>
  )
}

export type ModuleView = {
  n: string
  title: string
  meta: string
  locked: boolean
  topics: { title: string; kind: string }[]
}

export function CourseModules({ modules, learnHref }: { modules: ModuleView[]; learnHref: string }) {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true })
  const allOpen = modules.every((_, i) => open[i])
  const toggleAll = () => setOpen(allOpen ? {} : Object.fromEntries(modules.map((_, i) => [i, true])))
  return (
    <section className="sec bg-surface" aria-labelledby="md">
      <div className="wrap stack g24">
        <div className="row between end g16">
          <h2 className="sec-title" id="md">Course Modules</h2>
          {modules.length > 0 && <button className="btn btn-t" onClick={toggleAll} style={{ padding: '0' }}>{allOpen ? 'Collapse all' : 'Expand all'}</button>}
        </div>
        <div>
          {modules.map((m, i) => (
            <div className="cr-mod" key={i}>
              <button className="cr-mod-h" aria-expanded={!!open[i]} onClick={() => setOpen({ ...open, [i]: !open[i] })}>
                <span className={m.locked ? 'cr-mod-n lock' : 'cr-mod-n'}>{m.n}</span>{' '}
                <span className="cr-mod-t"><b>{m.title}</b><span>{m.meta}</span></span>{' '}
                <span className={m.locked ? 'bdg b-reg' : 'bdg b-ok'}>{m.locked ? 'Coming soon' : 'Available'}</span>{' '}
                <svg className={open[i] ? 'cr-chev up' : 'cr-chev'} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              {open[i] && (
                <ol className="cr-topics">
                  {m.topics.map((t, j) => (
                    <li className="cr-topic" key={j}>
                      <span className={t.kind === 'Video' ? 'cr-ti v' : t.kind === 'Quiz' ? 'cr-ti q' : 'cr-ti'} aria-hidden="true">{t.kind === 'Video' ? '▶' : t.kind === 'Quiz' ? '?' : String.fromCharCode(9636)}</span>{' '}
                      <span className="grow">{t.title}</span>{' '}
                      <span className="cr-kind">{t.kind}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
        {learnHref && <a className="btn btn-p btn-lg self-start" href={learnHref}>Start course now</a>}
      </div>
    </section>
  )
}
