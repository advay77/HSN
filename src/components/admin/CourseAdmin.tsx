'use client'

// Ported from AdminCourses.dc.html: the courses table and the course editor (5 tabs, lesson builder,
// PowerPoint import). Edits stay in this component until "Save course" / "Save lesson" writes the whole
// course through saveCourseAction.
import { useRouter } from 'next/navigation'
import React, { useRef, useState, useTransition } from 'react'

import {
  deleteCourseAction,
  importPptxAction,
  saveCourseAction,
  uploadImageAction,
  uploadImportedImageAction,
  uploadTutorialAction,
} from '@/app/(frontend)/admin/courses/actions'
import type { ImportResult } from '@/lib/admin/pptx'
import { CourseTagRow, OpenAccessIcon, PaidAccessIcon, RegistrationIcon } from '@/components/courses/CourseTags'
import { AdminTopbar } from './AdminTopbar'
import { toUploadable } from '@/lib/uploads/client'
import {
  refsToText,
  typeOfKind,
  type CourseRow,
  type EditorCourse,
  type EditorLesson,
  type EditorModule,
  type LessonType,
  type ModuleStatus,
  type Retakes,
} from './courseTypes'

type Tab = 'basics' | 'learn' | 'build' | 'cert' | 'publish'
type Sel = { m: number; l: number } | null

const LV: Record<string, string> = { Beginner: 'bdg b-beg', Intermediate: 'bdg b-int', Advanced: 'bdg b-adv' }
const ICON: Record<LessonType, string> = { Slide: String.fromCharCode(9636), Video: '▶', Reading: '≡', Document: String.fromCharCode(9638), Quiz: '?' }
const IC: Record<LessonType, string> = { Slide: 'cb-ti', Video: 'cb-ti v', Reading: 'cb-ti r', Document: 'cb-ti d', Quiz: 'cb-ti q' }
const TUTORIAL_ACCEPT = '.pdf,.doc,.docx,.odt,.rtf,.txt,.ppt,.pptx,.xls,.xlsx,.csv'
const PASS: [number, string][] = [
  [60, '3 of 5'],
  [80, '4 of 5'],
  [100, '5 of 5'],
]

const Chevron = ({ cls }: { cls?: string }) => (
  <svg className={cls} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
)
const SelArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
)
const Tick = ({ color = '#0B6B3A', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>
)

const blankLesson = (type: LessonType): EditorLesson =>
  type === 'Quiz'
    ? { kind: 'quiz', title: 'New quiz', body: '', video: '', refs: [], qs: [{ q: '', o: ['', '', '', ''], a: 0 }] }
    : {
        kind: type === 'Video' ? 'video' : type === 'Reading' ? 'references' : type === 'Document' ? 'document' : 'text',
        title: 'New ' + (type === 'Document' ? 'tutorial' : type.toLowerCase()),
        body: '',
        video: '',
        refs: [],
        qs: [],
      }

const listText = (ns: number[]) => (ns.length > 1 ? `slides ${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}` : `slide ${ns[0]}`)

export function CourseAdmin({ rows, initial, adminInitial }: { rows: CourseRow[]; initial: EditorCourse; adminInitial: string }) {
  const router = useRouter()
  const [f, setF] = useState<EditorCourse>(initial)
  const [tab, setTab] = useState<Tab>('basics')
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true })
  const [selL, setSelL] = useState<Sel>(initial.modules[0]?.lessons.length ? { m: 0, l: 0 } : null)
  const [newSkill, setNewSkill] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState<'' | 'course' | 'lesson'>('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState('')
  const [busy, setBusy] = useState('')
  const [pending, start] = useTransition()
  const coverInput = useRef<HTMLInputElement>(null)
  const slideInput = useRef<HTMLInputElement>(null)
  const pptxInput = useRef<HTMLInputElement>(null)
  const tutorialInput = useRef<HTMLInputElement>(null)
  const lessonFileInput = useRef<HTMLInputElement>(null)

  const mods = f.modules
  const lessonTotal = mods.reduce((a, m) => a + m.lessons.length, 0)
  const pubCount = rows.filter((r) => r.published).length
  const L = selL ? mods[selL.m]?.lessons[selL.l] ?? null : null
  const LT = L ? typeOfKind(L.kind) : null

  const change = (patch: Partial<EditorCourse>) => {
    setF((x) => ({ ...x, ...patch }))
    setDirty(true)
    setSaved('')
  }
  const upd = (k: keyof EditorCourse) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change({ [k]: e.target.value } as Partial<EditorCourse>)
  const setMods = (m: EditorModule[], sel?: Sel) => {
    change({ modules: m })
    if (sel !== undefined) setSelL(sel)
  }
  const clone = () => mods.map((m) => ({ ...m, lessons: m.lessons.slice() }))
  const updL = (patch: Partial<EditorLesson>) => {
    if (!selL || !L) return
    const m = clone()
    m[selL.m]!.lessons[selL.l] = { ...L, ...patch }
    setMods(m)
  }

  const go = (href: string) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return
    router.push(href)
  }

  const save = (which: 'course' | 'lesson') => {
    setError('')
    start(async () => {
      const r = await saveCourseAction(f)
      if (!r.ok) {
        setError(r.error)
        return
      }
      setDirty(false)
      setSaved(which)
      if (!f.id) {
        router.replace(`/admin/courses?edit=${r.course.id}`)
        return
      }
      setF(r.course)
      router.refresh()
    })
  }

  const del = () => {
    if (!f.id) {
      setDirty(false)
      router.push('/admin/courses')
      return
    }
    if (!window.confirm(`Delete “${f.title || 'Untitled course'}”? Its lessons and learners’ progress will be removed. This cannot be undone.`)) return
    start(async () => {
      const r = await deleteCourseAction(f.id!)
      if (!r.ok) setError(r.error)
      else {
        setDirty(false)
        router.push('/admin/courses')
        router.refresh()
      }
    })
  }

  const upload = async (file: File | undefined | null, alt: string) => {
    if (!file) return null
    const fd = new FormData()
    setBusy('Uploading…')
    try {
      fd.set('file', await toUploadable(file, 'admin'))
    } catch (err) {
      setBusy('')
      setError(err instanceof Error ? err.message : 'The image could not be uploaded.')
      return null
    }
    fd.set('alt', alt)
    const r = await uploadImageAction(fd)
    setBusy('')
    if (!r.ok) {
      setError(r.error)
      return null
    }
    return r.image
  }

  const chooseCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = await upload(e.target.files?.[0], f.title || 'Course cover')
    e.target.value = ''
    if (img) change({ cover: img })
  }
  const chooseSlideImage = async (file: File | undefined | null) => {
    const img = await upload(file, L?.title || 'Lesson image')
    if (img) updL({ image: img })
  }

  const pickPptx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError('')
    setImporting(null)
    const fd = new FormData()
    setBusy('Reading the presentation…')
    try {
      fd.set('file', await toUploadable(file, 'admin'))
    } catch (err) {
      setBusy('')
      setImportError(err instanceof Error ? err.message : 'The file could not be uploaded.')
      return
    }
    const r = await importPptxAction(fd)
    setBusy('')
    if (!r.ok) setImportError(r.error)
    else setImporting(r.result)
  }

  const attachTutorial = async (file: File | undefined | null, into: 'module' | 'lesson') => {
    if (!file) return
    setImportError('')
    setError('')
    const fd = new FormData()
    setBusy('Uploading the tutorial…')
    try {
      fd.set('file', await toUploadable(file, 'admin'))
    } catch (err) {
      setBusy('')
      const message = err instanceof Error ? err.message : 'The file could not be uploaded.'
      if (into === 'lesson') setError(message)
      else setImportError(message)
      return
    }
    fd.set('alt', file.name.replace(/\.[^.]+$/, '') || 'Tutorial')
    const r = await uploadTutorialAction(fd)
    setBusy('')
    if (!r.ok) {
      if (into === 'lesson') setError(r.error)
      else setImportError(r.error)
      return
    }
    const title = file.name.replace(/\.[^.]+$/, '') || 'Tutorial'
    if (into === 'lesson') {
      updL({ kind: 'document', file: r.file, title: L?.title && L.title !== 'New tutorial' ? L.title : title })
      return
    }
    const m = clone()
    m.push({
      title,
      status: 'Available',
      lessons: [{ kind: 'document', title, body: '', video: '', refs: [], qs: [], file: r.file }],
    })
    setMods(m, { m: m.length - 1, l: 0 })
    setOpen((o) => ({ ...o, [m.length - 1]: true }))
    setImporting(null)
  }

  const doImport = () => {
    if (!importing) return
    const res = importing
    start(async () => {
      setBusy('Adding the module…')
      const lessons: EditorLesson[] = []
      for (const l of res.lessons) {
        let image: EditorLesson['image'] = null
        if (l.image) {
          const up = await uploadImportedImageAction({ ...l.image, alt: l.title })
          if (up.ok) image = up.image
        }
        lessons.push({
          kind: l.kind === 'diagram' && !image ? 'text' : l.kind,
          title: l.title,
          body: l.body,
          video: l.video ?? '',
          image,
          refs: (l.references ?? []).map((r) => ({ text: r.text, url: r.url })),
          qs: [],
        })
      }
      setBusy('')
      const m = clone()
      m.push({ title: res.fileName.replace(/\.pptx$/i, ''), status: 'Coming soon', lessons })
      setMods(m, { m: m.length - 1, l: 0 })
      setOpen((o) => ({ ...o, [m.length - 1]: true }))
      setImporting(null)
    })
  }

  const addModule = () => {
    const m = clone()
    m.push({ title: `Module ${m.length + 1} title`, status: 'Coming soon', lessons: [] })
    setMods(m)
    setOpen((o) => ({ ...o, [m.length - 1]: true }))
  }
  const addL = (i: number, type: LessonType) => () => {
    const m = clone()
    m[i]!.lessons.push(blankLesson(type))
    setMods(m, { m: i, l: m[i]!.lessons.length - 1 })
    setOpen((o) => ({ ...o, [i]: true }))
  }
  const pickType = (t: LessonType) => {
    if (!L || t === LT) return
    if (t === 'Quiz') updL({ kind: 'quiz', qs: L.qs.length ? L.qs : [{ q: '', o: ['', '', '', ''], a: 0 }] })
    else if (t === 'Video') updL({ kind: 'video' })
    else if (t === 'Reading') updL({ kind: 'references' })
    else if (t === 'Document') updL({ kind: 'document' })
    else updL({ kind: L.image ? 'diagram' : 'text' })
  }

  const qs = L?.qs ?? []
  const setQs = (n: EditorLesson['qs']) => updL({ qs: n })

  const outcomeList = f.outcomes.split('\n').filter((x) => x.trim())
  const coverSrc = f.cover?.url || '/images/hsn-logo.jpg'
  const pageMap: [string, Tab, boolean][] = [
    ['Top of page', 'basics', !!(f.title && f.desc)],
    ['Course facts', 'basics', !!f.duration],
    ['What you will learn', 'learn', !!f.outcomes.trim()],
    ['About', 'learn', !!f.aboutLead.trim()],
    ['Modules', 'build', lessonTotal > 0],
    ['Certificate', 'cert', f.certOn],
    ['Publishing', 'publish', f.published],
  ]
  const TABS: [Tab, string][] = [
    ['basics', 'Basics'],
    ['learn', 'What you’ll learn'],
    ['build', 'Modules & lessons'],
    ['cert', 'Certificate'],
    ['publish', 'Publishing'],
  ]
  const passOpts = PASS.some(([v]) => v === f.certPass) ? PASS : [...PASS, [f.certPass, `${f.certPass}%`] as [number, string]]
  const passLabel = passOpts.find(([v]) => v === f.certPass)?.[1] ?? `${f.certPass}%`
  const liveHref = f.id && f.published && f.slug ? `/courses/${f.slug}` : null
  const previewBody = L ? (L.body.length > 220 ? L.body.slice(0, 220) + '…' : L.body || 'Lesson text appears here.') : ''
  const readingText = L ? L.readingText ?? refsToText(L.refs) : ''
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <AdminTopbar
        initial={adminInitial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Courses</h1><span className="small muted">{pubCount} published · {rows.length - pubCount} {rows.length - pubCount === 1 ? 'draft' : 'drafts'}</span></div>}
        actions={<button className="btn btn-p btn-sm" onClick={() => go('/admin/courses?new=1')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Add course</button>}
      />
      <main className="amain">
        <section className="card" style={{ overflowX: 'auto', position: 'relative' }} aria-labelledby="cl">
          <h2 className="sr" id="cl">All courses</h2>
          <table className="atbl m">
            <thead><tr><th scope="col">Course</th><th scope="col">Level</th><th scope="col">Modules</th><th scope="col">Status</th><th scope="col">Learners</th><th scope="col">Updated</th><th scope="col"><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} style={c.id === f.id ? { background: '#E3F1E4' } : undefined}>
                  <td><strong>{c.title || 'Untitled course'}</strong></td>
                  <td data-l="Level"><span className={LV[c.level]}>{c.level}</span></td>
                  <td data-l="Modules" className="small">{c.modules}</td>
                  <td data-l="Status"><span className={c.published ? 'bdg b-ok' : 'bdg b-reg'}>{c.published ? 'Published' : 'Draft'}</span></td>
                  <td data-l="Learners" className="small strong">{c.learners}</td>
                  <td data-l="Updated" className="small">{c.updated}</td>
                  <td><button className="btn btn-g btn-sm" onClick={() => go(`/admin/courses?edit=${c.id}`)} aria-label={'Edit ' + (c.title || 'untitled course')}>Edit</button></td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={7}><span className="muted">No courses yet. Fill in the form below and save to create the first one.</span></td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="card pad-l stack g20" aria-labelledby="ed">
          <div className="row between g12">
            <div className="stack g4"><span className="over">{f.id ? 'Edit course' : 'New course'}</span><h2 className="h3" id="ed" style={{ margin: 0 }}>{f.title || 'Untitled course'}</h2></div>
            <div className="row g12"><span className={f.published ? 'bdg b-ok' : 'bdg b-reg'}>{f.published ? 'Published' : 'Draft'}</span>{liveHref && <a className="btn btn-s btn-sm" href={liveHref} target="_blank" rel="noopener">View on website</a>}</div>
          </div>
          <nav className="cb-map" aria-label="Course page sections">
            <span className="small muted strong">Course page sections</span>
            {pageMap.map(([label, id, ok]) => (
              <button key={label} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><span className={ok ? 'cb-dot' : 'cb-dot todo'} aria-hidden="true">{ok ? '✓' : '!'}</span>{label}</button>
            ))}
          </nav>
          <div className="cb-tabs" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} className={tab === id ? 'cb-tab on' : 'cb-tab'} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}{id === 'build' && <> <span className="cnt">{lessonTotal}</span></>}</button>
            ))}
          </div>

          {/* Basics: hero + course facts */}
          {tab === 'basics' && (
            <div className="cb-grid">
              <div className="stack g24">
                <fieldset className="cb-fs">
                  <legend>Top of the course page</legend>
                  <div className="fld"><label className="lbl" htmlFor="c-t">Course title</label><input className="inp" id="c-t" value={f.title} onChange={upd('title')} /></div>
                  <div className="fld"><label className="lbl" htmlFor="c-d">Short description</label><textarea className="inp" id="c-d" value={f.desc} onChange={upd('desc')}></textarea><span className="hint">Shown under the title and on the course card.</span></div>
                  <div className="grid c2" style={{ gap: '20px' }}>
                    <div className="fld"><label className="lbl" htmlFor="c-l">Level</label><span className="sel"><select className="inp" id="c-l" value={f.level} onChange={upd('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><SelArrow /></span></div>
                    <div className="fld"><label className="lbl" htmlFor="c-by">Created by</label><input className="inp" id="c-by" value={f.by} onChange={upd('by')} /></div>
                  </div>
                  <div className="fld"><label className="lbl" htmlFor="c-k">Course type</label><span className="sel"><select className="inp" id="c-k" value={f.kind} onChange={upd('kind')}><option>Full course</option><option>Micro-course</option></select><SelArrow /></span><span className="hint">Shown on the course card in the library.</span></div>
                  <div className="stack g8"><span className="lbl">Tags shown above the title</span>
                    <div className="row g8">
                      <button className={f.access === 'open' ? 'chp on' : 'chp'} aria-pressed={f.access === 'open'} onClick={() => change({ access: 'open' })}><OpenAccessIcon size={16} />Open access</button>
                      <button className={f.access === 'paid' ? 'chp on' : 'chp'} aria-pressed={f.access === 'paid'} onClick={() => change({ access: 'paid' })}><PaidAccessIcon size={16} />Paid access</button>
                      <button className={f.tagRegistration ? 'chp on' : 'chp'} aria-pressed={f.tagRegistration} onClick={() => change({ tagRegistration: !f.tagRegistration })}><RegistrationIcon size={16} />Registration</button>
                      <button className={f.tagSelf ? 'chp on' : 'chp'} aria-pressed={f.tagSelf} onClick={() => change({ tagSelf: !f.tagSelf })}>Self-paced</button>
                      <button className={f.tagVideo ? 'chp on' : 'chp'} aria-pressed={f.tagVideo} onClick={() => change({ tagVideo: !f.tagVideo })}>Contains video</button>
                    </div>
                    <span className="hint">Visitors see these above the course title. Access is always first. This screen is only the editor.</span>
                  </div>
                </fieldset>
                <fieldset className="cb-fs">
                  <legend>Cover image</legend>
                  <div className="res"><img src={coverSrc} alt="" style={{ width: '72px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} /><span className="grow small strong">{f.cover?.name || 'No image yet'}</span><button type="button" className="btn btn-t btn-sm" onClick={() => coverInput.current?.click()} disabled={!!busy}>{f.cover ? 'Replace' : 'Choose image'}</button></div>
                  <input ref={coverInput} type="file" accept="image/*" className="sr" tabIndex={-1} aria-hidden="true" onChange={chooseCover} />
                  <div className="fld"><label className="lbl" htmlFor="c-cb">Label on the image</label><input className="inp" id="c-cb" value={f.coverBadge} onChange={upd('coverBadge')} placeholder="e.g. Free for members" /><span className="hint">Leave empty for no label.</span></div>
                </fieldset>
                <fieldset className="cb-fs">
                  <legend>Course facts strip</legend>
                  <div className="row g12 small"><span className="cb-auto"><b>{mods.length} modules</b>{' '}· counted automatically</span><span className="cb-auto"><b>{lessonTotal} lessons</b>{' '}· counted automatically</span></div>
                  <div className="grid c2" style={{ gap: '20px' }}>
                    <div className="fld"><label className="lbl" htmlFor="c-du">Average duration</label><input className="inp" id="c-du" value={f.duration} onChange={upd('duration')} placeholder="e.g. 3 hours" /></div>
                    <div className="fld"><label className="lbl" htmlFor="c-la">Language</label><input className="inp" id="c-la" value={f.language} onChange={upd('language')} /></div>
                  </div>
                  <div className="fld"><label className="lbl" htmlFor="c-ln">Language note</label><input className="inp" id="c-ln" value={f.languageNote} onChange={upd('languageNote')} placeholder="e.g. Hindi and Arabic coming soon" /></div>
                </fieldset>
              </div>
              <aside className="stack g12 sticky" aria-labelledby="pv">
                <h3 className="h5" id="pv" style={{ margin: 0 }}>Course card preview</h3>
                <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative' }}><img src={coverSrc} alt="" style={{ display: 'block', width: '100%', height: '150px', objectFit: 'cover', background: '#0B6B3A' }} />{f.coverBadge && <span className="bdg b-feat" style={{ position: 'absolute', top: '12px', left: '12px' }}>{f.coverBadge}</span>}{!f.published && <span className="bdg" style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#EDE7D8', color: '#4A5F63' }}>Draft · not visible</span>}</div>
                  <div className="pad stack g12" style={{ paddingTop: '20px' }}>
                    <CourseTagRow access={f.access} registration={f.tagRegistration}>
                      <span className={LV[f.level]}>{f.level}</span>
                      {f.tagSelf && <span className="bdg b-reg">Self-paced</span>}
                      {f.tagVideo && <span className="bdg b-reg">Contains video</span>}
                    </CourseTagRow>
                    <h4 className="h4" style={{ margin: 0 }}>{f.title || 'Course title'}</h4>
                    <p className="small muted" style={{ margin: 0 }}>{f.desc ? (f.desc.length > 140 ? f.desc.slice(0, 140) + '…' : f.desc) : 'A short description appears here.'}</p>
                    <span className="small muted strong">{mods.length} modules · {lessonTotal} lessons · {f.duration || 'Duration'}</span>
                    <span className="btn btn-p btn-sm" style={{ alignSelf: 'flex-start' }}>Start course</span>
                  </div>
                </article>
              </aside>
            </div>
          )}

          {/* What you'll learn + About */}
          {tab === 'learn' && (
            <div className="cb-grid">
              <div className="stack g24">
                <fieldset className="cb-fs">
                  <legend>What you will learn</legend>
                  <div className="fld"><label className="lbl" htmlFor="c-li">Intro sentence</label><textarea className="inp" id="c-li" value={f.learnIntro} onChange={upd('learnIntro')} style={{ minHeight: '80px' }}></textarea></div>
                  <div className="fld"><label className="lbl" htmlFor="c-o">Learning outcomes</label><textarea className="inp" id="c-o" value={f.outcomes} onChange={upd('outcomes')} style={{ minHeight: '170px' }}></textarea><span className="hint">One outcome per line. Each line becomes a ticked item.</span></div>
                  <div className="stack g8"><label className="lbl" htmlFor="c-sk">Skills you will build</label>
                    <div className="row g8">{f.skills.map((s, i) => <span key={i} className="cb-chip">{s}<button className="cb-chip-x" aria-label={'Remove skill ' + s} onClick={() => change({ skills: f.skills.filter((_, j) => j !== i) })}>×</button></span>)}</div>
                    <div className="row g8">
                      <input
                        className="inp grow"
                        id="c-sk"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newSkill.trim()) change({ skills: [...f.skills, newSkill.trim()] })
                            setNewSkill('')
                          }
                        }}
                        placeholder="Add a skill"
                        style={{ minWidth: 0 }}
                      />
                      <button className="btn btn-g btn-sm" onClick={() => { if (newSkill.trim()) change({ skills: [...f.skills, newSkill.trim()] }); setNewSkill('') }}>Add</button>
                    </div>
                  </div>
                </fieldset>
                <fieldset className="cb-fs">
                  <legend>About this course</legend>
                  <div className="fld"><label className="lbl" htmlFor="c-al">Opening paragraph</label><textarea className="inp" id="c-al" value={f.aboutLead} onChange={upd('aboutLead')} style={{ minHeight: '90px' }}></textarea><span className="hint">Shown in larger text.</span></div>
                  <div className="fld"><label className="lbl" htmlFor="c-ab">More detail</label><textarea className="inp" id="c-ab" value={f.aboutBody} onChange={upd('aboutBody')} style={{ minHeight: '120px' }}></textarea></div>
                </fieldset>
              </div>
              <aside className="stack g12 sticky">
                <h3 className="h5" style={{ margin: 0 }}>Preview</h3>
                <div className="card pad stack g12">
                  <span className="cb-ph">What you will learn</span>
                  <p className="small muted" style={{ margin: 0 }}>{f.learnIntro}</p>
                  <ul className="ticks" style={{ margin: 0 }}>{outcomeList.map((o, i) => <li key={i} className="small"><Tick size={18} />{o}</li>)}</ul>
                  <div className="row g8">{f.skills.map((s, i) => <span key={i} className="cb-chip" style={{ paddingInlineEnd: '12px' }}>{s}</span>)}</div>
                </div>
              </aside>
            </div>
          )}

          {/* Certificate */}
          {tab === 'cert' && (
            <div className="cb-grid">
              <div className="stack g24">
                <div className="row between g12" style={{ padding: '14px 16px', borderRadius: '12px', background: '#F5F1E6' }}>
                  <span className="stack"><span className="strong" id="cert-l">Award a certificate</span><span className="small muted">{f.certOn ? 'Learners get a certificate after passing every quiz' : 'No certificate; the section is hidden on the course page'}</span></span>
                  <button className={f.certOn ? 'sw on' : 'sw'} role="switch" aria-checked={f.certOn} aria-labelledby="cert-l" onClick={() => change({ certOn: !f.certOn })}></button>
                </div>
                <fieldset className="cb-fs">
                  <legend>Certificate section on the course page</legend>
                  <div className="fld"><label className="lbl" htmlFor="c-ct">Heading</label><input className="inp" id="c-ct" value={f.certTitle} onChange={upd('certTitle')} /></div>
                  <div className="fld"><label className="lbl" htmlFor="c-cx">Text</label><textarea className="inp" id="c-cx" value={f.certText} onChange={upd('certText')} style={{ minHeight: '90px' }}></textarea></div>
                  <div className="fld"><label className="lbl" htmlFor="c-s1">Step 1</label><input className="inp" id="c-s1" value={f.certStep1} onChange={upd('certStep1')} /></div>
                  <div className="fld"><label className="lbl" htmlFor="c-s2">Step 2</label><input className="inp" id="c-s2" value={f.certStep2} onChange={upd('certStep2')} /></div>
                  <div className="fld"><label className="lbl" htmlFor="c-s3">Step 3</label><input className="inp" id="c-s3" value={f.certStep3} onChange={upd('certStep3')} /></div>
                </fieldset>
                <fieldset className="cb-fs">
                  <legend>Rules</legend>
                  <div className="grid c2" style={{ gap: '20px' }}>
                    <div className="fld"><label className="lbl" htmlFor="c-cp">Quiz pass mark</label><span className="sel"><select className="inp" id="c-cp" value={f.certPass} onChange={(e) => change({ certPass: Number(e.target.value) })}>{passOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><SelArrow /></span><span className="hint">Applies to every module quiz.</span></div>
                    <div className="fld"><label className="lbl" htmlFor="c-cr">Quiz retakes</label><span className="sel"><select className="inp" id="c-cr" value={f.certRetakes} onChange={(e) => change({ certRetakes: e.target.value as Retakes })}><option>Unlimited</option><option>3 attempts</option><option>1 attempt</option></select><SelArrow /></span></div>
                  </div>
                  <div className="fld"><label className="lbl" htmlFor="c-cn">Issued by (printed on the certificate)</label><input className="inp" id="c-cn" value={f.certIssuer} onChange={upd('certIssuer')} /></div>
                </fieldset>
              </div>
              <aside className="stack g12 sticky">
                <h3 className="h5" style={{ margin: 0 }}>Certificate preview</h3>
                <div className="cb-paper">
                  <img src="/images/hsn-logo.jpg" alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                  <span className="cb-paper-k">Certificate of completion</span>
                  <span className="small muted">This certifies that</span>
                  <span className="cb-paper-name">Learner name</span>
                  <span className="small muted">has successfully completed</span>
                  <strong style={{ fontFamily: "'Aptos Display','Aptos','Segoe UI Variable Display','Segoe UI',Inter,system-ui,sans-serif", fontSize: '15px', lineHeight: '21px' }}>{f.title || 'Course title'}</strong>
                  <div className="cb-paper-f"><span><b>{today}</b>Date issued</span><span><b>{f.certIssuer}</b>Issued by</span></div>
                </div>
                <span className="small muted">Learners download it as a PDF after passing the last quiz.</span>
              </aside>
            </div>
          )}

          {/* Publishing */}
          {tab === 'publish' && (
            <div className="stack g16" style={{ maxWidth: '760px' }}>
              <div className="row between g12" style={{ padding: '14px 16px', borderRadius: '12px', background: '#F5F1E6' }}>
                <span className="stack"><span className="strong" id="pub-l">Published</span><span className="small muted">{f.published ? 'Visible in the course library' : 'Only you can see it'}</span></span>
                <button className={f.published ? 'sw on' : 'sw'} role="switch" aria-checked={f.published} aria-labelledby="pub-l" onClick={() => change({ published: !f.published })}></button>
              </div>
              <div className="row between g12" style={{ padding: '14px 16px', borderRadius: '12px', background: '#F5F1E6' }}>
                <span className="stack"><span className="strong" id="ft-l">Featured course</span><span className="small muted">Shown in the large card at the top of the Courses page</span></span>
                <button className={f.featured ? 'sw on' : 'sw'} role="switch" aria-checked={f.featured} aria-labelledby="ft-l" onClick={() => change({ featured: !f.featured })}></button>
              </div>
              <div className="fld"><span className="lbl" id="vis-l">Who can take this course</span>
                <div className="seg self-start" role="group" aria-labelledby="vis-l">{(['Everyone', 'Members only'] as const).map((v) => <button key={v} className={f.visibility === v ? 'on' : ''} aria-pressed={f.visibility === v} onClick={() => change({ visibility: v })}>{v}</button>)}</div>
                <span className="hint">Visitors always see the course page. This controls who can open the lessons.</span>
              </div>
              <div className="fld"><label className="lbl" htmlFor="c-sl">Web address</label><div className="row nowrap g8"><span className="small muted" style={{ whiteSpace: 'nowrap' }}>hsn…/courses/</span><input className="inp grow" id="c-sl" value={f.slug} onChange={upd('slug')} placeholder="Made from the title if left empty" style={{ minWidth: 0 }} /></div></div>
            </div>
          )}

          {/* Builder */}
          {tab === 'build' && (
            <div className="cb-grid">
              <div className="stack g16">
                <div className="cb-imp">
                  <span className="ic ic-a"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path><path d="M12 8v5M9.5 10.5 12 13l2.5-2.5"></path></svg></span>
                  <span className="stack g4"><strong>Import a PowerPoint or a tutorial</strong><span className="small muted">PowerPoint: each slide becomes a lesson. A tutorial (Word, PDF, and similar files) is added as one lesson learners can open.</span></span>
                  <span className="cb-imp-actions">
                    <button className="btn btn-s btn-sm" onClick={() => pptxInput.current?.click()} disabled={!!busy}>Choose .pptx</button>
                    <button className="btn btn-s btn-sm" onClick={() => tutorialInput.current?.click()} disabled={!!busy}>Upload tutorial</button>
                  </span>
                  <input ref={pptxInput} type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="sr" tabIndex={-1} aria-hidden="true" onChange={pickPptx} />
                  <input ref={tutorialInput} type="file" accept={TUTORIAL_ACCEPT} className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { attachTutorial(e.target.files?.[0], 'module'); e.target.value = '' }} />
                </div>
                {busy && <p className="small muted" role="status">{busy}</p>}
                {importError && <div className="note note-err" role="alert"><span>{importError}</span></div>}
                {importing && (
                  <div className="cb-found" role="status">
                    <div className="row between g12"><strong>{importing.fileName}</strong><button className="cb-mini" aria-label="Cancel import" onClick={() => setImporting(null)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>
                    <ul className="ticks" style={{ margin: 0 }}>
                      <li><Tick />{importing.slides} {importing.slides === 1 ? 'slide' : 'slides'} found → {importing.lessons.length} {importing.lessons.length === 1 ? 'lesson' : 'lessons'}</li>
                      {importing.videoSlides.length > 0 && <li><Tick />{importing.videoSlides.length} YouTube {importing.videoSlides.length === 1 ? 'video' : 'videos'} on {listText(importing.videoSlides)} → video {importing.videoSlides.length === 1 ? 'lesson' : 'lessons'}</li>}
                      {(importing.diagramSlides.length > 0 || importing.referenceSlides.length > 0) && (
                        <li><Tick />{[importing.diagramSlides.length ? `Diagram on ${listText(importing.diagramSlides)}` : '', importing.referenceSlides.length ? `References on ${listText(importing.referenceSlides)}` : ''].filter(Boolean).join(' · ')}</li>
                      )}
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A5A00" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16h.01"></path></svg>Quiz not in the file: add the questions after import</li>
                    </ul>
                    <div className="row g12"><button className="btn btn-p btn-sm" onClick={doImport} disabled={pending}>Add as Module {mods.length + 1}</button><button className="btn btn-t btn-sm" onClick={() => setImporting(null)}>Cancel</button></div>
                  </div>
                )}
                {mods.map((m, i) => (
                  <div key={m.id ?? `new-${i}`} className="cb-mod">
                    <div className="cb-mod-h">
                      <span className="cb-n">{i + 1}</span>
                      <label className="sr" htmlFor={'mt-' + i}>Module {i + 1} title</label>
                      <input className="inp grow" id={'mt-' + i} value={m.title} onChange={(e) => { const c = clone(); c[i] = { ...c[i]!, title: e.target.value }; setMods(c) }} style={{ minWidth: '160px' }} />
                      <span className="sel cb-status"><select className="inp" aria-label={'Module ' + (i + 1) + ' status'} value={m.status} onChange={(e) => { const c = clone(); c[i] = { ...c[i]!, status: e.target.value as ModuleStatus }; setMods(c) }}><option>Available</option><option>Coming soon</option><option>Hidden</option></select><SelArrow size={18} /></span>
                      <button className="cb-mini" aria-label={(open[i] ? 'Collapse' : 'Expand') + ' module ' + (i + 1)} aria-expanded={!!open[i]} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}><Chevron cls={open[i] ? 'cr-up' : ''} /></button>
                      <button className="cb-mini" aria-label={'Delete module ' + (i + 1)} onClick={() => { if (!window.confirm(`Delete module ${i + 1} “${m.title}” and its ${m.lessons.length} lessons?`)) return; const c = clone(); c.splice(i, 1); setMods(c, null) }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg></button>
                    </div>
                    {open[i] && (
                      <>
                        <ol className="cb-rows">
                          {m.lessons.map((l, j) => {
                            const on = !!selL && selL.m === i && selL.l === j
                            const t = typeOfKind(l.kind)
                            const move = (d: number) => () => { const c = clone(); const arr = c[i]!.lessons; const x = arr[j]!; arr[j] = arr[j + d]!; arr[j + d] = x; setMods(c, { m: i, l: j + d }) }
                            return (
                              <li key={l.id ?? `n-${j}`} className={on ? 'cb-row sel' : 'cb-row'}>
                                <button className="cb-pick" onClick={() => { setSelL({ m: i, l: j }); setSaved('') }} aria-pressed={on}><span className={IC[t]} aria-hidden="true">{ICON[t]}</span><span className="t">{(j + 1) + '. ' + (l.title || 'Untitled')}</span></button>{' '}
                                <span className="cb-type">{t}</span>{' '}
                                <button className="cb-mini" aria-label={'Move ' + l.title + ' up'} onClick={move(-1)} disabled={j === 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 15 6-6 6 6"></path></svg></button>{' '}
                                <button className="cb-mini" aria-label={'Move ' + l.title + ' down'} onClick={move(1)} disabled={j === m.lessons.length - 1}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>{' '}
                                <button className="cb-mini" aria-label={'Delete ' + l.title} onClick={() => { const c = clone(); c[i]!.lessons.splice(j, 1); setMods(c, null) }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
                              </li>
                            )
                          })}
                        </ol>
                        <div className="cb-add"><span className="small muted strong" style={{ alignSelf: 'center' }}>Add:</span>
                          <button className="btn btn-g btn-sm" onClick={addL(i, 'Slide')}>+ Slide</button>
                          <button className="btn btn-g btn-sm" onClick={addL(i, 'Video')}>+ Video</button>
                          <button className="btn btn-g btn-sm" onClick={addL(i, 'Reading')}>+ Reading</button>
                          <button className="btn btn-g btn-sm" onClick={addL(i, 'Document')}>+ Tutorial</button>
                          <button className="btn btn-g btn-sm" onClick={addL(i, 'Quiz')}>+ Quiz</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {mods.length === 0 && (
                  <div className="card pad stack g8" style={{ alignItems: 'center', textAlign: 'center' }}><strong>No modules yet</strong><span className="small muted">Import a PowerPoint, upload a tutorial, or add an empty module to start.</span></div>
                )}
                <button className="btn btn-s self-start" onClick={addModule}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Add empty module</button>
              </div>
              {/* Lesson editor */}
              <aside className="stack g16 sticky" aria-labelledby="le">
                {L && LT && selL && (
                  <>
                    <div className="card pad stack g16">
                      <div className="stack g4"><span className="over">{'Module ' + (selL.m + 1) + ' · Lesson ' + (selL.l + 1) + ' · ' + LT}</span><h3 className="h4" id="le" style={{ margin: 0 }}>Edit lesson</h3></div>
                      <div className="fld"><span className="lbl" id="lt-l">Lesson type</span>
                        <div className="seg" role="group" aria-labelledby="lt-l" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                          {(['Slide', 'Video', 'Reading', 'Document', 'Quiz'] as LessonType[]).map((t) => <button key={t} className={LT === t ? 'on' : ''} aria-pressed={LT === t} onClick={() => pickType(t)}>{t === 'Document' ? 'Tutorial' : t}</button>)}
                        </div>
                      </div>
                      <div className="fld"><label className="lbl" htmlFor="l-t">Lesson title</label><input className="inp" id="l-t" value={L.title} onChange={(e) => updL({ title: e.target.value })} /></div>
                      {LT === 'Document' && (
                        <div className="stack g8">
                          <span className="lbl">Tutorial file</span>
                          {L.file ? (
                            <div className="res"><span className="grow small strong">{L.file.name}</span><button type="button" className="btn btn-t btn-sm" onClick={() => lessonFileInput.current?.click()} disabled={!!busy}>Replace</button><button className="cb-mini" aria-label="Remove file" onClick={() => updL({ file: null })}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>
                          ) : (
                            <button type="button" className="btn btn-s btn-sm self-start" onClick={() => lessonFileInput.current?.click()} disabled={!!busy}>Choose a file</button>
                          )}
                          <input ref={lessonFileInput} type="file" accept={TUTORIAL_ACCEPT} className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { attachTutorial(e.target.files?.[0], 'lesson'); e.target.value = '' }} />
                          <span className="hint">Word, PDF, and similar files. Learners open or download it in the lesson.</span>
                          <div className="fld"><label className="lbl" htmlFor="l-b">Text shown with the file (optional)</label><textarea className="inp" id="l-b" value={L.body} onChange={(e) => updL({ body: e.target.value })} style={{ minHeight: '100px' }}></textarea></div>
                        </div>
                      )}
                      {LT === 'Reading' && (
                        <div className="fld"><label className="lbl" htmlFor="l-b">Reading text or references</label><textarea className="inp" id="l-b" value={readingText} onChange={(e) => updL({ readingText: e.target.value })} style={{ minHeight: '150px' }}></textarea><span className="hint">One reference per line. A link at the end of a line becomes its web address.</span></div>
                      )}
                      {(LT === 'Slide' || LT === 'Video') && (
                        <div className="fld"><label className="lbl" htmlFor="l-b">{LT === 'Video' ? 'Text shown above the video' : 'Slide text'}</label><textarea className="inp" id="l-b" value={L.body} onChange={(e) => updL({ body: e.target.value })} style={{ minHeight: '150px' }}></textarea></div>
                      )}
                      {LT === 'Video' && (
                        <div className="fld"><label className="lbl" htmlFor="l-v">YouTube link</label><input className="inp" id="l-v" type="url" value={L.video} onChange={(e) => updL({ video: e.target.value })} placeholder="https://www.youtube.com/watch?v=" /><span className="hint">Learners watch it inside the lesson.</span></div>
                      )}
                      {LT === 'Slide' && (
                        <div className="stack g8"><span className="lbl">Image or diagram (optional)</span>
                          {L.image ? (
                            <div className="res"><img src={L.image.url} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} /><span className="grow small strong">{L.image.name}</span><button className="cb-mini" aria-label="Remove image" onClick={() => updL({ image: null, kind: L.kind === 'diagram' ? 'text' : L.kind })}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>
                          ) : (
                            <div
                              className="drop"
                              style={{ padding: '16px' }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault()
                                chooseSlideImage(e.dataTransfer.files?.[0])
                              }}
                            >
                              <span><button type="button" className="btn btn-t" style={{ padding: '0 4px', minHeight: '44px' }} onClick={() => slideInput.current?.click()} disabled={!!busy}>Choose an image</button>{' '}or drag it here</span>
                            </div>
                          )}
                          <input ref={slideInput} type="file" accept="image/*" className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { chooseSlideImage(e.target.files?.[0]); e.target.value = '' }} />
                        </div>
                      )}
                      {LT === 'Quiz' && (
                        <div className="stack g12">
                          <div className="fld"><label className="lbl" htmlFor="l-p">Pass mark</label><span className="sel"><select className="inp" id="l-p" value={f.certPass} onChange={(e) => change({ certPass: Number(e.target.value) })}>{passOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><SelArrow /></span></div>
                          {qs.map((q, qi) => (
                            <div key={qi} className="cb-q">
                              <div className="row between g8"><label className="lbl" htmlFor={'q-' + qi}>Question {qi + 1}</label><button className="cb-mini" aria-label={'Delete question ' + (qi + 1)} onClick={() => { const n = qs.slice(); n.splice(qi, 1); setQs(n) }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>
                              <input className="inp" id={'q-' + qi} value={q.q} onChange={(e) => { const n = qs.slice(); n[qi] = { ...q, q: e.target.value }; setQs(n) }} placeholder="Question" />
                              <span className="small muted">Answers · select the correct one</span>
                              {q.o.map((text, oi) => (
                                <div key={oi} className="cb-opt"><input type="radio" name={'qa-' + qi} checked={q.a === oi} onChange={() => { const n = qs.slice(); n[qi] = { ...q, a: oi }; setQs(n) }} aria-label={'Mark answer ' + (oi + 1) + ' of question ' + (qi + 1) + ' as correct'} /><input className="inp grow" value={text} onChange={(e) => { const n = qs.slice(); const o = q.o.slice(); o[oi] = e.target.value; n[qi] = { ...q, o }; setQs(n) }} aria-label={'Question ' + (qi + 1) + ', answer ' + (oi + 1)} placeholder="Answer" /></div>
                              ))}
                            </div>
                          ))}
                          <button className="btn btn-g btn-sm self-start" onClick={() => setQs([...qs, { q: '', o: ['', '', '', ''], a: 0 }])}>+ Add question</button>
                        </div>
                      )}
                      <div className="row g12"><button className="btn btn-p" onClick={() => save('lesson')} disabled={pending}>Save lesson</button><span className="small muted">{saved === 'lesson' ? 'Saved' : ''}</span></div>
                    </div>
                    <div className="stack g8">
                      <span className="h5">Learner preview</span>
                      <div className="cb-prev">
                        <div className="cb-prev-b"><img src="/images/hsn-logo.jpg" alt="" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />Healthcare Sustainability Network</div>
                        <div className="cb-prev-s">
                          <h4>{L.title}</h4>
                          {(LT === 'Slide' || LT === 'Video') && <p>{previewBody}</p>}
                          {LT === 'Reading' && <p>{readingText ? (readingText.length > 220 ? readingText.slice(0, 220) + '…' : readingText) : 'Lesson text appears here.'}</p>}
                          {LT === 'Document' && <p>{L.file ? L.file.name : 'A Word document, PDF, or similar file appears here.'}</p>}
                          {LT === 'Video' && <div className="cb-vid"><svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></div>}
                          {LT === 'Slide' && L.image && <img src={L.image.url} alt="" style={{ width: '160px', alignSelf: 'center' }} />}
                          {LT === 'Quiz' && <p className="muted">{qs.length} questions · pass mark {passLabel}</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {!L && (
                  <div className="card pad stack g8"><strong id="le">Select a lesson to edit it</strong><span className="small muted">Or import a PowerPoint, or upload a Word document, PDF, or similar tutorial.</span></div>
                )}
              </aside>
            </div>
          )}

          <div className="row g12 mstack" style={{ paddingTop: '8px', borderTop: '1px solid #D9D2C1' }}>
            <button className="btn btn-p" onClick={() => save('course')} disabled={pending}>Save course</button>
            {liveHref && <a className="btn btn-s" href={liveHref} target="_blank" rel="noopener">Preview course page</a>}
            <button className="btn btn-dl" onClick={del} disabled={pending} style={{ marginInlineStart: 'auto' }}>{f.id ? 'Delete course' : 'Discard'}</button>
          </div>
          {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
          {saved === 'course' && !error && <div className="note note-ok" role="status"><span><strong>Saved.</strong>{' '}{f.published ? 'Changes are live on the course page.' : 'Saved as a draft.'}</span></div>}
        </section>
      </main>
    </>
  )
}
