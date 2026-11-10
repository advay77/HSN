'use client'

// Case study editor. There is no design board for it, so it uses the AdminCourses.dc.html editor language:
// cb-tabs, cb-fs fieldsets, cb-mod repeatable blocks, .fld/.lbl/.inp fields and the Save row.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { saveCaseStudy, type CaseForm } from '@/app/(frontend)/admin/case-studies/actions'
import { addIcon, chevron, ErrorText, FilePicker, move, RowControls, type CurrentFile } from '@/components/admin/editor/EditorParts'
import { toUploadable } from '@/lib/uploads/client'

type Tab = 'basics' | 'impact' | 'sections' | 'more' | 'submitter' | 'publish'
const TABS: [Tab, string][] = [
  ['basics', 'Basics'],
  ['impact', 'Measured impact'],
  ['sections', 'Full case study'],
  ['more', 'Lessons & files'],
  ['submitter', 'Submitted by'],
  ['publish', 'Publishing'],
]
// Which tab each server error key belongs to, so a failed save opens the right tab.
const tabOfError = (key: string): Tab =>
  key.startsWith('impact') ? 'impact' : key.startsWith('section') ? 'sections' : key.startsWith('lesson') ? 'more' : key === 'email' ? 'submitter' : key === 'slug' ? 'publish' : 'basics'

const COLORS: [string, string][] = [
  ['#134E5E', 'Dark teal'],
  ['#4FAE4E', 'Leaf green'],
  ['#5BC0E3', 'Aqua'],
  ['#0B6B3A', 'Deep green'],
]
const STATUSES: [CaseForm['status'], string, string][] = [
  ['draft', 'Draft', 'Only visible here in the admin panel.'],
  ['submitted', 'Waiting for approval', 'Shown in the approval queue.'],
  ['published', 'Published', 'Visible on the website’s Case Studies page.'],
  ['returned', 'Returned with a note', 'The submitter sees your note on their dashboard.'],
  ['rejected', 'Rejected', 'Kept here, never shown on the website.'],
]

const emptyCase = (): CaseForm => ({
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  region: '',
  country: '',
  organization: '',
  color: '#134E5E',
  summary: '',
  impacts: [],
  sections: [],
  imageId: null,
  imageCaption: '',
  lessons: [],
  patientSafety: '',
  pdfId: null,
  submittedBy: { name: '', email: '', role: '', attachmentIds: [] },
  reviewNote: '',
})

export function CaseEditor({
  id,
  initial,
  categories,
  regions,
  currentImage,
  currentPdf,
  attachments,
  publishedAt,
  saved,
}: {
  id: number | null
  initial: CaseForm | null
  categories: readonly string[]
  regions: readonly string[]
  currentImage: CurrentFile
  currentPdf: CurrentFile
  attachments: { id: number; name: string; url: string }[]
  publishedAt: string | null
  saved?: boolean
}) {
  const router = useRouter()
  const [f, setF] = useState<CaseForm>(() => initial ?? emptyCase())
  const [tab, setTab] = useState<Tab>('basics')
  const [image, setImage] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [img, setImg] = useState<CurrentFile>(currentImage)
  const [doc, setDoc] = useState<CurrentFile>(currentPdf)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedText, setSavedText] = useState(saved ? 'Saved.' : '')
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()

  const set = <K extends keyof CaseForm>(k: K, v: CaseForm[K]) => {
    setF((x) => ({ ...x, [k]: v }))
    setDirty(true)
    setSavedText('')
  }
  const setAt = <K extends 'impacts' | 'sections' | 'lessons'>(k: K, i: number, patch: Partial<CaseForm[K][number]>) =>
    set(k, f[k].map((row, j) => (j === i ? { ...row, ...patch } : row)) as CaseForm[K])
  const val = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => fn(e.target.value)

  const save = () =>
    start(async () => {
      const fd = new FormData()
      fd.set('data', JSON.stringify({ ...f, imageId: img ? f.imageId : null, pdfId: doc ? f.pdfId : null }))
      try {
        if (image) fd.set('image', await toUploadable(image, 'admin'))
        if (pdf) fd.set('pdf', await toUploadable(pdf, 'admin'))
      } catch (err) {
        setErrors({ form: err instanceof Error ? err.message : 'The file could not be uploaded.' })
        return
      }
      const r = await saveCaseStudy(id, fd)
      if (!r.ok) {
        setErrors(r.errors)
        const first = Object.keys(r.errors).find((k) => k !== 'form')
        if (first) setTab(tabOfError(first))
        setSavedText('')
        return
      }
      setErrors({})
      setDirty(false)
      if (!id) {
        router.replace(`/admin/case-studies/${r.id}?saved=1`)
        return
      }
      setImage(null)
      setPdf(null)
      setF((x) => ({ ...x, slug: r.slug }))
      setSavedText(f.status === 'published' ? 'Saved and live on the website.' : 'Saved.')
      router.refresh()
    })

  const errCount = Object.keys(errors).length
  const statusHint = STATUSES.find(([s]) => s === f.status)?.[2]
  const tabErr = (t: Tab) => Object.keys(errors).some((k) => k !== 'form' && tabOfError(k) === t)

  return (
    <>
      {errCount > 0 && (
        <div className="note note-err" role="alert">
          <span><strong>Not saved.</strong>{' '}{errors.form || 'Please fix the highlighted fields.'}</span>
        </div>
      )}
      <div className="cb-tabs" role="tablist">
        {TABS.map(([t, label]) => (
          <button key={t} type="button" className={tab === t ? 'cb-tab on' : 'cb-tab'} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {label}
            {tabErr(t) && <span className="cnt" style={{ marginInlineStart: '6px', background: '#FBE4E1', color: '#B3261E' }}>!</span>}
          </button>
        ))}
      </div>

      {tab === 'basics' && (
        <div className="stack g24" style={{ maxWidth: '900px' }}>
          <fieldset className="cb-fs">
            <legend>Top of the case study page</legend>
            <div className="fld"><label className="lbl" htmlFor="cs-t">Title <span className="req">*</span></label><input className={errors.title ? 'inp err' : 'inp'} id="cs-t" value={f.title} onChange={val((v) => set('title', v))} /><ErrorText>{errors.title}</ErrorText></div>
            <div className="grid c2" style={{ gap: '20px' }}>
              <div className="fld"><label className="lbl" htmlFor="cs-c">Category <span className="req">*</span></label><span className="sel"><select className={errors.category ? 'inp err' : 'inp'} id="cs-c" value={f.category} onChange={val((v) => set('category', v))}><option value="">Choose a category</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>{chevron}</span><ErrorText>{errors.category}</ErrorText></div>
              <div className="fld"><label className="lbl" htmlFor="cs-r">Region <span className="opt-t">(optional)</span></label><span className="sel"><select className={errors.region ? 'inp err' : 'inp'} id="cs-r" value={f.region} onChange={val((v) => set('region', v))}><option value="">No region</option>{regions.map((c) => <option key={c}>{c}</option>)}</select>{chevron}</span><ErrorText>{errors.region}</ErrorText></div>
              <div className="fld"><label className="lbl" htmlFor="cs-o">Organization / hospital</label><input className="inp" id="cs-o" value={f.organization} onChange={val((v) => set('organization', v))} /><span className="hint">Shown as “By …” on the website.</span></div>
              <div className="fld"><label className="lbl" htmlFor="cs-co">Country</label><input className="inp" id="cs-co" value={f.country} onChange={val((v) => set('country', v))} /></div>
            </div>
            <div className="fld"><label className="lbl" htmlFor="cs-s">Summary <span className="req">*</span></label><textarea className={errors.summary ? 'inp err' : 'inp'} id="cs-s" value={f.summary} onChange={val((v) => set('summary', v))} style={{ minHeight: '110px' }}></textarea><span className="hint">Shown when the row is opened on the Case Studies page.</span><ErrorText>{errors.summary}</ErrorText></div>
            <div className="fld"><span className="lbl" id="cs-col">Colour in the list</span>
              <div className="seg self-start" role="group" aria-labelledby="cs-col" style={{ flexWrap: 'wrap', maxWidth: '100%' }}>
                {COLORS.map(([c, label]) => (
                  <button key={c} type="button" className={f.color === c ? 'on' : ''} aria-pressed={f.color === c} onClick={() => set('color', c)}><span aria-hidden="true" style={{ width: '14px', height: '14px', borderRadius: '4px', background: c, marginInlineEnd: '8px' }}></span>{label}</button>
                ))}
              </div>
            </div>
          </fieldset>
        </div>
      )}

      {tab === 'impact' && (
        <div className="stack g16" style={{ maxWidth: '900px' }}>
          <p className="muted" style={{ margin: 0 }}>Up to 4 results. The first one is the headline number in the list and the green card on the page.</p>
          {f.impacts.map((imp, i) => (
            <div key={i} className="cb-mod">
              <div className="cb-mod-h"><span className="cb-n">{i + 1}</span><strong className="grow">{i === 0 ? 'Headline result' : `Result ${i + 1}`}</strong><RowControls label={`result ${i + 1}`} index={i} count={f.impacts.length} onMove={(to) => set('impacts', move(f.impacts, i, to))} onDelete={() => set('impacts', f.impacts.filter((_, j) => j !== i))} /></div>
              <div className="cb-mod-b">
                <div className="grid c2" style={{ gap: '16px' }}>
                  <div className="fld"><label className="lbl" htmlFor={`im-v-${i}`}>Value</label><input className="inp" id={`im-v-${i}`} value={imp.value} placeholder="e.g. 120 tCO2e" onChange={val((v) => setAt('impacts', i, { value: v }))} /></div>
                  <div className="fld"><label className="lbl" htmlFor={`im-l-${i}`}>Label</label><input className="inp" id={`im-l-${i}`} value={imp.label} placeholder="e.g. saved per year" onChange={val((v) => setAt('impacts', i, { label: v }))} /></div>
                </div>
                <div className="fld"><label className="lbl" htmlFor={`im-n-${i}`}>Note <span className="opt-t">(optional)</span></label><input className="inp" id={`im-n-${i}`} value={imp.note} placeholder="e.g. Carbon, from reduced anesthetic gas use" onChange={val((v) => setAt('impacts', i, { note: v }))} /></div>
                <ErrorText>{errors[`impact-${i}`]}</ErrorText>
              </div>
            </div>
          ))}
          {f.impacts.length === 0 && <div className="card empty" style={{ padding: '32px 24px' }}><p className="muted" style={{ margin: 0 }}>No results yet.</p></div>}
          {f.impacts.length < 4 && <button type="button" className="btn btn-s btn-sm self-start" onClick={() => set('impacts', [...f.impacts, { value: '', label: '', note: '' }])}>{addIcon}Add a result</button>}
        </div>
      )}

      {tab === 'sections' && (
        <div className="stack g16" style={{ maxWidth: '900px' }}>
          <p className="muted" style={{ margin: 0 }}>Each section gets its own heading and a link under “On this page”, e.g. The Challenge, What the Team Did, Measuring the Impact.</p>
          {f.sections.map((s, i) => (
            <div key={i} className="cb-mod">
              <div className="cb-mod-h"><span className="cb-n">{i + 1}</span><label className="sr" htmlFor={`se-h-${i}`}>Section {i + 1} heading</label><input className={errors[`section-${i}`] ? 'inp err grow' : 'inp grow'} id={`se-h-${i}`} value={s.heading} placeholder="Section heading" onChange={val((v) => setAt('sections', i, { heading: v }))} style={{ minWidth: 0 }} /><RowControls label={`section ${i + 1}`} index={i} count={f.sections.length} onMove={(to) => set('sections', move(f.sections, i, to))} onDelete={() => set('sections', f.sections.filter((_, j) => j !== i))} /></div>
              <div className="cb-mod-b">
                <ErrorText>{errors[`section-${i}`]}</ErrorText>
                <div className="fld"><label className="lbl" htmlFor={`se-l-${i}`}>Opening sentence <span className="opt-t">(optional, larger text)</span></label><textarea className="inp" id={`se-l-${i}`} value={s.lead} onChange={val((v) => setAt('sections', i, { lead: v }))} style={{ minHeight: '80px' }}></textarea></div>
                <div className="fld"><label className="lbl" htmlFor={`se-b-${i}`}>Text</label><textarea className="inp" id={`se-b-${i}`} value={s.body} onChange={val((v) => setAt('sections', i, { body: v }))} style={{ minHeight: '150px' }}></textarea><span className="hint">Leave a blank line between paragraphs.</span></div>
                <div className="cb-sub">
                  <span className="lbl">Ticked list <span className="opt-t">(optional)</span></span>
                  {s.bullets.map((b, k) => (
                    <div key={k} className="cb-line"><label className="sr" htmlFor={`se-${i}-b-${k}`}>Item {k + 1}</label><input className="inp" id={`se-${i}-b-${k}`} value={b} onChange={val((v) => setAt('sections', i, { bullets: s.bullets.map((x, j) => (j === k ? v : x)) }))} /><RowControls label={`item ${k + 1}`} index={k} count={s.bullets.length} onMove={(to) => setAt('sections', i, { bullets: move(s.bullets, k, to) })} onDelete={() => setAt('sections', i, { bullets: s.bullets.filter((_, j) => j !== k) })} /></div>
                  ))}
                  <button type="button" className="btn btn-t btn-sm self-start" onClick={() => setAt('sections', i, { bullets: [...s.bullets, ''] })}>{addIcon}Add an item</button>
                </div>
                <div className="cb-sub">
                  <span className="lbl">Results table <span className="opt-t">(optional)</span></span>
                  {s.tableRows.length > 0 && <div className="cb-line3 small strong muted" aria-hidden="true"><span>Dimension</span><span>Measure</span><span>Result</span><span style={{ width: '116px' }}></span></div>}
                  {s.tableRows.map((r, k) => (
                    <div key={k} className="cb-line3">
                      <input className="inp" aria-label={`Row ${k + 1} dimension`} value={r.dimension} placeholder="e.g. Environmental" onChange={val((v) => setAt('sections', i, { tableRows: s.tableRows.map((x, j) => (j === k ? { ...x, dimension: v } : x)) }))} />
                      <input className="inp" aria-label={`Row ${k + 1} measure`} value={r.measure} placeholder="e.g. tCO2e per year" onChange={val((v) => setAt('sections', i, { tableRows: s.tableRows.map((x, j) => (j === k ? { ...x, measure: v } : x)) }))} />
                      <input className="inp" aria-label={`Row ${k + 1} result`} value={r.result} placeholder="e.g. 120 saved" onChange={val((v) => setAt('sections', i, { tableRows: s.tableRows.map((x, j) => (j === k ? { ...x, result: v } : x)) }))} />
                      <RowControls label={`row ${k + 1}`} index={k} count={s.tableRows.length} onMove={(to) => setAt('sections', i, { tableRows: move(s.tableRows, k, to) })} onDelete={() => setAt('sections', i, { tableRows: s.tableRows.filter((_, j) => j !== k) })} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-t btn-sm self-start" onClick={() => setAt('sections', i, { tableRows: [...s.tableRows, { dimension: '', measure: '', result: '' }] })}>{addIcon}Add a row</button>
                </div>
              </div>
            </div>
          ))}
          {f.sections.length === 0 && <div className="card empty" style={{ padding: '32px 24px' }}><p className="muted" style={{ margin: 0 }}>No sections yet. Only the summary will be shown.</p></div>}
          <button type="button" className="btn btn-s btn-sm self-start" onClick={() => set('sections', [...f.sections, { heading: '', lead: '', body: '', bullets: [], tableRows: [] }])}>{addIcon}Add a section</button>
        </div>
      )}

      {tab === 'more' && (
        <div className="cb-grid">
          <div className="stack g24">
            <fieldset className="cb-fs">
              <legend>Lessons for other hospitals</legend>
              {f.lessons.map((l, i) => (
                <div key={i} className="cb-mod">
                  <div className="cb-mod-h"><span className="cb-n">{i + 1}</span><label className="sr" htmlFor={`le-t-${i}`}>Lesson {i + 1} title</label><input className={errors[`lesson-${i}`] ? 'inp err grow' : 'inp grow'} id={`le-t-${i}`} value={l.title} placeholder="Lesson title" onChange={val((v) => setAt('lessons', i, { title: v }))} style={{ minWidth: 0 }} /><RowControls label={`lesson ${i + 1}`} index={i} count={f.lessons.length} onMove={(to) => set('lessons', move(f.lessons, i, to))} onDelete={() => set('lessons', f.lessons.filter((_, j) => j !== i))} /></div>
                  <div className="cb-mod-b"><label className="sr" htmlFor={`le-x-${i}`}>Lesson {i + 1} text</label><textarea className="inp" id={`le-x-${i}`} value={l.text} onChange={val((v) => setAt('lessons', i, { text: v }))} style={{ minHeight: '90px' }}></textarea><ErrorText>{errors[`lesson-${i}`]}</ErrorText></div>
                </div>
              ))}
              <button type="button" className="btn btn-s btn-sm self-start" onClick={() => set('lessons', [...f.lessons, { title: '', text: '' }])}>{addIcon}Add a lesson</button>
            </fieldset>
          </div>
          <div className="stack g24">
            <fieldset className="cb-fs">
              <legend>Downloadable PDF</legend>
              <FilePicker label="Full case study as a PDF" hint="Visitors get a “Download PDF” button." accept="application/pdf" current={doc} chosen={pdf} onChoose={(file) => { setPdf(file); setDirty(true) }} onRemove={() => { setPdf(null); setDoc(null); setDirty(true) }} />
            </fieldset>
          </div>
        </div>
      )}

      {tab === 'submitter' && (
        <div className="stack g24" style={{ maxWidth: '900px' }}>
          <fieldset className="cb-fs">
            <legend>Submitted by</legend>
            <p className="small muted" style={{ margin: 0 }}>Filled in automatically when the case study comes from the website form. Leave empty for case studies HSN writes.</p>
            <div className="grid c3" style={{ gap: '16px' }}>
              <div className="fld"><label className="lbl" htmlFor="sb-n">Name</label><input className="inp" id="sb-n" value={f.submittedBy.name} onChange={val((v) => set('submittedBy', { ...f.submittedBy, name: v }))} /></div>
              <div className="fld"><label className="lbl" htmlFor="sb-e">Email</label><input className={errors.email ? 'inp err' : 'inp'} id="sb-e" type="email" value={f.submittedBy.email} onChange={val((v) => set('submittedBy', { ...f.submittedBy, email: v }))} /><ErrorText>{errors.email}</ErrorText></div>
              <div className="fld"><label className="lbl" htmlFor="sb-r">Role</label><input className="inp" id="sb-r" value={f.submittedBy.role} onChange={val((v) => set('submittedBy', { ...f.submittedBy, role: v }))} /></div>
            </div>
            {attachments.length > 0 && (
              <div className="stack g8"><span className="lbl">Files they sent</span>
                <div className="row g8">{attachments.filter((a) => f.submittedBy.attachmentIds.includes(a.id)).map((a) => <a key={a.id} className="res" href={a.url} target="_blank" rel="noopener" style={{ padding: '8px 12px' }}><span className="small strong">{a.name}</span></a>)}</div>
              </div>
            )}
          </fieldset>
          <fieldset className="cb-fs">
            <legend>Note to the submitter</legend>
            <div className="fld"><label className="lbl" htmlFor="sb-note">Review note</label><textarea className="inp" id="sb-note" value={f.reviewNote} onChange={val((v) => set('reviewNote', v))} style={{ minHeight: '96px' }}></textarea><span className="hint">Shown on their dashboard when the case study is returned. To email it, use “Return with a note” in the approval queue.</span></div>
          </fieldset>
        </div>
      )}

      {tab === 'publish' && (
        <div className="stack g16" style={{ maxWidth: '760px' }}>
          <div className="fld"><label className="lbl" htmlFor="cs-st">Status</label><span className="sel"><select className="inp" id="cs-st" value={f.status} onChange={val((v) => set('status', v as CaseForm['status']))}>{STATUSES.map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>{chevron}</span><span className="hint">{statusHint}{publishedAt && f.status === 'published' ? ` First published ${new Date(publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.` : ''}</span></div>
          <div className="fld"><label className="lbl" htmlFor="cs-sl">Web address</label><div className="row nowrap g8"><span className="small muted" style={{ whiteSpace: 'nowrap' }}>hsn…/case-studies/</span><input className={errors.slug ? 'inp err grow' : 'inp grow'} id="cs-sl" value={f.slug} placeholder="filled from the title" onChange={val((v) => set('slug', v))} style={{ minWidth: 0 }} /></div><ErrorText>{errors.slug}</ErrorText></div>
        </div>
      )}

      <div className="row g12 mstack" style={{ paddingTop: '8px', borderTop: '1px solid #D9D2C1' }}>
        <button type="button" className="btn btn-p" disabled={pending} onClick={save}>{pending ? 'Saving…' : id ? 'Save case study' : 'Create case study'}</button>
        {id && f.slug && <a className="btn btn-s" href={`/case-studies/${f.slug}${f.status === 'published' ? '' : '?preview=1'}`} target="_blank" rel="noopener">{f.status === 'published' ? 'View on website' : 'Preview'}</a>}
        <Link className="btn btn-t" href="/admin/case-studies">Back to case studies</Link>
        <span className="small muted" role="status">{dirty ? 'Unsaved changes' : ''}</span>
      </div>
      {savedText && !dirty && <div className="note note-ok" role="status"><span><strong>{savedText}</strong></span></div>}
    </>
  )
}
