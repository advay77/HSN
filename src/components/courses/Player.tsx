'use client'

// Ported from Player.dc.html: top bar, outline, lesson stage, quiz and lesson navigation.
// Progress and quiz results are saved through server actions (src/lib/courses/actions.ts).
import React, { useEffect, useMemo, useState, useTransition } from 'react'

import { A11yPanel } from '@/components/site/A11yPanel'
import { completeLesson, submitQuiz } from '@/lib/courses/actions'
import type { QuizResult } from '@/lib/courses/data'

export type PlayerLesson = {
  id: string
  type: 'cover' | 'text' | 'reflection' | 'diagram' | 'video' | 'references' | 'document' | 'summary' | 'quiz'
  title: string
  kind: string
  body: string
  extra: string
  image: { url: string; alt: string } | null
  file: { url: string; name: string; pdf: boolean } | null
  youtube: string | null
  references: { text: string; url: string; linkText: string }[]
  draft: boolean
  questions: { q: string; o: string[]; a: number | null }[]
  need: number
}

export type PlayerModule = {
  n: number
  title: string
  status: 'available' | 'coming-soon'
  slides: { url: string; label: string } | null
  lessons: PlayerLesson[]
}

type Props = {
  course: { id: number; slug: string; title: string; retakes: boolean; maxAttempts: number; certificate: boolean }
  modules: PlayerModule[]
  initialCompleted: string[]
  initialResults: Record<string, QuizResult>
  startAt: string | null
  whatsapp: string
}

// Lesson text: a blank line starts a new paragraph, a single line break stays a line break.
function Paras({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>{para.split('\n').map((line, j) => (j ? [<br key={j} />, line] : line))}</p>
      ))}
    </>
  )
}

const shortUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export function Player({ course, modules, initialCompleted, initialResults, startAt, whatsapp }: Props) {
  const [completed, setCompleted] = useState<string[]>(initialCompleted)
  const [results, setResults] = useState<Record<string, QuizResult>>(initialResults)
  const [corrections, setCorrections] = useState<Record<string, number[]>>({})
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({})
  const [submittedNow, setSubmittedNow] = useState<Record<string, boolean>>({})
  const [playing, setPlaying] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [a11yOpen, setA11yOpen] = useState(false)
  const [error, setError] = useState('')
  const [, start] = useTransition()
  const done = useMemo(() => new Set(completed), [completed])

  // Available modules unlock in order: each needs every quiz in the earlier modules passed.
  const avail = modules.filter((m) => m.status === 'available')
  const unlocked: PlayerModule[] = []
  for (const m of avail) {
    unlocked.push(m)
    const quizzes = m.lessons.filter((l) => l.type === 'quiz')
    if (quizzes.some((q) => !results[q.id]?.passed)) break
  }
  const lockedRows = modules
    .filter((m) => !unlocked.includes(m))
    .map((m) => {
      const prevQuiz = [...unlocked].reverse().flatMap((u) => u.lessons).find((l) => l.type === 'quiz')
      return {
        n: m.n,
        title: m.title,
        note: m.status === 'coming-soon' ? 'Coming soon' : prevQuiz ? `Unlocks after ${prevQuiz.title}` : 'Locked',
      }
    })
  const list = unlocked.flatMap((m) => m.lessons.map((l) => ({ l, m })))
  const allPlayable = avail.flatMap((m) => m.lessons)
  const total = list.length

  // Lessons open in order: everything up to the first unfinished one.
  const reachOf = (d: Set<string>) => {
    const i = list.findIndex((x) => !d.has(x.l.id))
    return i < 0 ? total - 1 : i
  }
  const firstOpen = () => {
    const byId = startAt ? list.findIndex((x) => x.l.id === startAt) : -1
    if (byId >= 0) return Math.min(byId, reachOf(done))
    const i = list.findIndex((x) => !done.has(x.l.id))
    return i >= 0 ? i : 0
  }
  const [idx, setIdx] = useState(firstOpen)
  useEffect(() => {
    if (idx > total - 1) setIdx(Math.max(0, total - 1))
  }, [idx, total])

  if (!total) {
    return (
      <>
        <TopBar title={course.title} pct={0} slug={course.slug} outlineOpen={false} onOutline={() => {}} onA11y={() => setA11yOpen(true)} a11yOpen={a11yOpen} />
        <main className="pl-main">
          <section key={idx} className="pl-stage" aria-label="Lesson">
            <div className="pl-slide"><h2>Lessons are coming soon</h2><p>This course does not have any lessons available yet.</p></div>
          </section>
        </main>
        {a11yOpen && <A11yLayer onClose={() => setA11yOpen(false)} />}
      </>
    )
  }

  const { l: s, m: mod } = list[Math.min(idx, total - 1)]!
  const pctNum = allPlayable.length ? Math.round((allPlayable.filter((l) => done.has(l.id)).length / allPlayable.length) * 100) : 0
  const modLessons = mod.lessons.filter((l) => l.type !== 'quiz')
  const crumb = s.type === 'quiz' ? `Module ${mod.n} · Quiz` : `Module ${mod.n} · Lesson ${modLessons.indexOf(s) + 1} of ${modLessons.length}`
  const nextItem = list[idx + 1]
  const nextModule = modules.find((m) => m.n > mod.n)

  const reach = reachOf(done)
  const go = (i: number, force = false) => {
    if (!force && i > reach) {
      setError(`Please finish the earlier lessons first. Next up: “${list[reach]?.l.title ?? ''}”.`)
      setOutlineOpen(false)
      return
    }
    setIdx(i)
    setPlaying(false)
    setOutlineOpen(false)
    setError('')
    window.scrollTo({ top: 0 })
  }
  const markDone = (lessonId: string) => {
    if (done.has(lessonId)) return
    setCompleted((c) => [...c, lessonId])
    start(async () => {
      try {
        const r = await completeLesson(course.id, lessonId)
        setCompleted(r.completed)
      } catch {
        setError('Your progress could not be saved. Check your connection and try again.')
        setCompleted((c) => c.filter((x) => x !== lessonId))
      }
    })
  }
  const next = () => {
    if (s.type !== 'quiz') markDone(s.id)
    go(Math.min(idx + 1, total - 1), true)
  }

  // Quiz state for the current lesson
  const ans = answers[s.id] || {}
  const prior = results[s.id]
  const corr = corrections[s.id] ?? (s.questions.every((q) => q.a !== null) && s.questions.length ? s.questions.map((q) => q.a!) : null)
  // Out of tries when the course limits attempts (0 = unlimited) and this member has used them all.
  const outOfTries = !course.retakes || (!!prior && course.maxAttempts > 0 && (prior.attempts ?? 1) >= course.maxAttempts)
  const showResult = !!submittedNow[s.id] || (!!prior && (prior.passed || outOfTries))
  const lockedQuiz = showResult
  const score = showResult ? (prior?.score ?? 0) : 0
  const passed = showResult && !!prior?.passed
  const n = s.questions.length
  const answered = Object.keys(ans).length
  const submit = () => {
    const arr = s.questions.map((_, i) => (ans[i] ?? -1))
    start(async () => {
      try {
        const r = await submitQuiz(course.id, s.id, arr)
        setResults((x) => ({ ...x, [s.id]: { score: r.score, total: r.total, passed: r.passed, at: r.at, attempts: r.attempts } }))
        setCorrections((x) => ({ ...x, [s.id]: r.correct }))
        setCompleted(r.completed)
        setSubmittedNow((x) => ({ ...x, [s.id]: true }))
      } catch {
        setError('Your answers could not be submitted. Check your connection and try again.')
      }
    })
  }
  const retry = () => {
    setAnswers((x) => ({ ...x, [s.id]: {} }))
    setSubmittedNow((x) => ({ ...x, [s.id]: false }))
    setCorrections((x) => {
      const c = { ...x }
      delete c[s.id]
      return c
    })
  }
  const optCls = (qi: number, j: number) => {
    if (lockedQuiz && corr) return j === corr[qi] ? 'pl-opt ok' : ans[qi] === j ? 'pl-opt bad' : 'pl-opt'
    return ans[qi] === j ? 'pl-opt sel' : 'pl-opt'
  }

  const showNext = idx < total - 1 && (s.type !== 'quiz' || !!results[s.id]?.passed)
  const nextLong = s.type === 'quiz' ? 'Next module' : nextItem?.l.type === 'quiz' ? 'Go to quiz' : nextItem?.l.type === 'summary' ? 'Mark complete & finish' : 'Mark complete & next'
  const nextShort = nextItem?.l.type === 'quiz' ? 'Quiz' : 'Next'

  return (
    <>
      <TopBar title={course.title} pct={pctNum} slug={course.slug} outlineOpen={outlineOpen} onOutline={() => setOutlineOpen(!outlineOpen)} onA11y={() => setA11yOpen(true)} a11yOpen={a11yOpen} />
      <div className="pl-body">
        {/* Outline */}
        <nav className={outlineOpen ? 'pl-side open' : 'pl-side'} aria-label="Course outline">
          {unlocked.map((m) => {
            const offset = list.findIndex((x) => x.m === m)
            return (
              <React.Fragment key={m.n}>
                <div className="pl-mh"><span className="over">Module {m.n}</span><b>{m.title}</b><span className="small muted">{m.lessons.filter((l) => done.has(l.id)).length} of {m.lessons.length} complete</span></div>
                <ol className="pl-list">
                  {m.lessons.map((l, j) => {
                    const i = offset + j
                    const isDone = done.has(l.id)
                    return (
                      <li key={l.id}><button className={i === idx ? 'pl-item cur' : i > reach ? 'pl-item locked' : 'pl-item'} aria-current={i === idx ? 'step' : undefined} aria-disabled={i > reach || undefined} title={i > reach ? 'Finish the earlier lessons first' : undefined} onClick={() => go(i)}><span className={isDone ? 'pl-st done' : i === idx ? 'pl-st now' : 'pl-st'} aria-hidden="true">{isDone ? '✓' : i === idx ? '' : i > reach ? '🔒' : String(j + 1)}</span><span><span>{l.title}</span><span className="pl-k">{l.kind}</span></span></button></li>
                    )
                  })}
                </ol>
              </React.Fragment>
            )
          })}
          {lockedRows.map((r, i) => (
            <div key={r.n} className="pl-lock" style={i > 0 ? { marginTop: '0' } : undefined}><span className="pl-st" aria-hidden="true">{r.n}</span><span><span className="strong" style={{ color: '#17323A' }}>Module {r.n} · {r.title}</span><span className="pl-k">{r.note}</span></span></div>
          ))}
        </nav>
        <main className="pl-main">
          <div className="stack g4">
            <span className="over">{crumb}</span>
            <h1 className="h3" style={{ margin: '0' }}>{s.title}</h1>
          </div>
          {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
          <section className="pl-stage" aria-label="Lesson">
            <div className="pl-brand"><span className="row g8"><img src="/images/hsn-logo.jpg" alt="" />Healthcare Sustainability Network</span><span className="tabup">Created by Healthcare Sustainability Network</span></div>
            {s.type === 'cover' && (
              <div className="pl-slide pl-cover"><span className="over" style={{ color: '#BFE6F3' }}>{course.title}</span><h2>{s.title}</h2><Paras text={s.body} /></div>
            )}
            {s.type === 'text' && (
              <div className="pl-slide"><h2>{s.title}</h2><Paras text={s.body} /></div>
            )}
            {s.type === 'reflection' && (
              <div className="pl-slide"><h2>{s.title}</h2><p className="pl-ask">{s.body}</p>{s.extra && <p className="muted" style={{ fontSize: '17px' }}>{s.extra}</p>}</div>
            )}
            {s.type === 'diagram' && (
              <div className="pl-slide"><div className="pl-loop"><div className="stack g16"><h2>{s.title}</h2><Paras text={s.body} /></div>{s.image && <img src={s.image.url} alt={s.image.alt} />}</div></div>
            )}
            {s.type === 'video' && (
              <div className="pl-slide" style={{ justifyContent: 'flex-start' }}>
                <Paras text={s.body} />
                {s.youtube ? (
                  <>
                    <div className="pl-video">
                      {playing ? (
                        <iframe src={`https://www.youtube-nocookie.com/embed/${s.youtube}?autoplay=1&rel=0`} title={`${s.title} (YouTube video)`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
                      ) : (
                        <button className="pl-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${s.title}`}>
                          <span className="pl-play"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>{' '}
                          <span className="strong">Play video</span><span className="small" style={{ color: '#BFE6F3' }}>YouTube</span>
                        </button>
                      )}
                    </div>
                    <a className="small strong" href={`https://www.youtube.com/watch?v=${s.youtube}`} target="_blank" rel="noopener">Open on YouTube</a>
                  </>
                ) : (
                  <p className="muted">The video for this lesson will be added soon.</p>
                )}
              </div>
            )}
            {s.type === 'document' && (
              <div className="pl-slide" style={{ justifyContent: 'flex-start' }}>
                <h2>{s.title}</h2>
                <Paras text={s.body} />
                {s.file ? (
                  <>
                    {s.file.pdf && <iframe className="pl-doc" src={s.file.url} title={s.title}></iframe>}
                    <a className="res" href={s.file.url} download>
                      <span className="ic ic-a" style={{ width: '44px', height: '44px' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"></path><path d="M14 3v6h6"></path></svg></span>
                      <span className="stack grow"><span className="strong">{s.file.pdf ? 'Download this PDF' : 'Open this file'}</span><span className="small muted">{s.file.name}</span></span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C6E8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 20h14"></path></svg>
                    </a>
                  </>
                ) : (
                  <p className="muted">The file for this lesson will be added soon.</p>
                )}
              </div>
            )}
            {s.type === 'references' && (
              <div className="pl-slide" style={{ justifyContent: 'flex-start' }}><h2>{s.title}</h2>
                <Paras text={s.body} />
                <ol className="pl-refs">
                  {s.references.map((r, i) => (
                    <li key={i}>{r.text}{r.url && (<>{' '}<a href={r.url} target="_blank" rel="noopener">{r.linkText || shortUrl(r.url)}</a></>)}</li>
                  ))}
                </ol>
              </div>
            )}
            {s.type === 'summary' && (
              <div className="pl-slide pl-cover" style={{ alignItems: 'flex-start' }}>
                <span className="ic" style={{ background: '#4FAE4E', color: '#0E1F22' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></span>
                <h2>{s.title}</h2>
                <Paras text={s.body} />
                <div className="row g12 mstack">
                  {nextItem && <button className="btn btn-lg btn-light" onClick={next}>{nextItem.l.type === 'quiz' ? `Start ${nextItem.l.title}` : 'Continue'}</button>}
                  {!nextItem && !nextModule && course.certificate && (
                    pctNum === 100
                      ? <a className="btn btn-lg btn-light" href={`/courses/${course.slug}/certificate`}>Get your certificate</a>
                      : !done.has(s.id) && <button className="btn btn-lg btn-light" onClick={() => markDone(s.id)}>Finish course</button>
                  )}
                  {nextModule && <span className="small" style={{ color: '#BFE6F3' }}>Next module: {nextModule.title}</span>}
                </div>
              </div>
            )}
            {s.type === 'quiz' && (
              <div className="pl-slide" style={{ justifyContent: 'flex-start', gap: '16px' }}>
                <div className="row between g12"><h2>{s.title}</h2>{s.draft && <span className="bdg b-ex">Draft questions · HSN to confirm</span>}</div>
                <p className="muted" style={{ fontSize: '17px' }}>Answer all {n} questions. You need {s.need} correct to pass{nextModule ? ` and unlock Module ${nextModule.n}` : ''}.</p>
                {s.questions.map((q, qi) => (
                  <fieldset className="pl-q" key={qi}>
                    <legend>{qi + 1}. {q.q}</legend>
                    {q.o.map((text, j) => (
                      <label className={optCls(qi, j)} key={j}><input type="radio" name={`q${qi}`} checked={ans[qi] === j} disabled={lockedQuiz} onChange={() => setAnswers((x) => ({ ...x, [s.id]: { ...ans, [qi]: j } }))} /><span>{text}</span></label>
                    ))}
                  </fieldset>
                ))}
                {!showResult && (
                  <button className="btn btn-p btn-lg self-start" onClick={submit} disabled={answered < n}>{answered < n ? `Answer all ${n} to submit (${answered}/${n})` : 'Submit answers'}</button>
                )}
                {showResult && (
                  <div className="pl-res" role="status" style={passed ? { background: '#E3F1E4', color: '#17323A' } : { background: '#FBEFD5', color: '#17323A' }}>
                    <span className="pl-score">{score}/{n}</span>
                    <span className="stack g4 grow">
                      <strong>{passed ? (nextModule && nextModule.status === 'available' ? `Passed. Module ${nextModule.n} is unlocked.` : 'Passed. Well done.') : !outOfTries ? 'Not quite. Review the lessons and try again.' : 'Not quite.'}</strong>
                      <span className="muted">{passed ? (corr ? 'Correct answers are marked in green.' : 'You have passed this quiz.') : `You need ${s.need} out of ${n} to pass. Correct answers are marked in green.`}</span>
                    </span>
                    {passed && <a className="btn btn-p" href={`/courses/${course.slug}`}>Back to course</a>}
                    {!passed && !outOfTries && <button className="btn btn-s" onClick={retry}>Try again</button>}
                  </div>
                )}
              </div>
            )}
          </section>
          <div className="pl-nav">
            <button className="btn btn-s" onClick={() => go(Math.max(0, idx - 1))} disabled={idx === 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"></path><path d="m11 6-6 6 6 6"></path></svg>Previous</button>
            <span className="pl-count">{idx + 1} / {total}</span>
            {showNext && (
              <button className="btn btn-p" onClick={next}><span className="lbl-long">{nextLong}</span><span className="lbl-short">{nextShort}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg></button>
            )}
            {!showNext && idx === total - 1 && s.type !== 'quiz' && !done.has(s.id) && (
              <button className="btn btn-p" onClick={() => markDone(s.id)}><span className="lbl-long">Mark complete</span><span className="lbl-short">Done</span></button>
            )}
          </div>
          <div className="row g12">
            {mod.slides && (
              <a className="res" href={mod.slides.url} download style={{ flex: '1 1 260px' }}><span className="ic ic-a" style={{ width: '44px', height: '44px' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg></span><span className="stack grow"><span className="strong">Module {mod.n} slides</span><span className="small muted">{mod.slides.label}</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C6E8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 20h14"></path></svg></a>
            )}
            <a className="res" href={whatsapp} target="_blank" rel="noopener" style={{ flex: '1 1 260px' }}><span className="ic ic-g" style={{ width: '44px', height: '44px' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"></path></svg></span><span className="stack grow"><span className="strong">Discuss this module</span><span className="small muted">HSN WhatsApp group</span></span></a>
          </div>
        </main>
      </div>
      {a11yOpen && <A11yLayer onClose={() => setA11yOpen(false)} />}
    </>
  )
}

function TopBar({ title, pct, slug, outlineOpen, onOutline, onA11y, a11yOpen }: { title: string; pct: number; slug: string; outlineOpen: boolean; onOutline: () => void; onA11y: () => void; a11yOpen: boolean }) {
  return (
    <header className="pl-top">
      <a className="logo-m" href="/" aria-label="HSN home"><img src="/images/hsn-logo.jpg" alt="" /></a>
      <div className="pl-title">
        <b>{title}</b>
        <div className="pl-pbar"><div className="prog" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress"><span style={{ width: `${pct}%` }}></span></div><span>{pct}% complete</span></div>
      </div>
      <button className="btn btn-s btn-sm pl-outl" aria-expanded={outlineOpen} onClick={onOutline}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path></svg>Outline</button>
      <button className="a11y" aria-label="Accessibility options" aria-haspopup="dialog" aria-expanded={a11yOpen} onClick={onA11y}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg></button>
      <a className="btn btn-g btn-sm" href={`/courses/${slug}`} aria-label="Exit course" style={{ color: '#17323A' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg><span className="tabup">Exit</span></a>
    </header>
  )
}

function A11yLayer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: '0', zIndex: 60, background: 'rgba(14,31,34,.32)' }} onClick={onClose} aria-hidden="true"></div>
      <div style={{ position: 'fixed', top: '0', right: '0', bottom: '0', zIndex: 61, width: '440px', maxWidth: '100%', overflowY: 'auto', background: '#FFFDF8' }}><A11yPanel onClose={onClose} /></div>
    </>
  )
}
