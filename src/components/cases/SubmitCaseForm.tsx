'use client'

// The form half of SubmitCase.dc.html, wired to the submitCaseStudy server action.
import Link from 'next/link'
import React, { useActionState, useEffect, useRef, useState, startTransition } from 'react'

import { submitCaseStudy, type SubmitCaseState } from '@/app/(frontend)/(site)/case-studies/submit/actions'
import { toUploadable } from '@/lib/uploads/client'
import { Turnstile, turnstileOn } from '@/components/site/Turnstile'

const DRAFT_KEY = 'hsn-case-study-draft'
const UNITS = ['tCO2e saved per year', 'kWh saved per year', 'kg waste diverted', 'Cost saved per year']
const chevron = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
const errIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 16.5h.01"></path></svg>

type Fields = {
  name: string
  email: string
  organization: string
  country: string
  title: string
  category: string
  region: string
  summary: string
  patientSafety: string
  measures: { value: string; unit: string }[]
  permission: boolean
  noPatientData: boolean
}
const EMPTY: Fields = {
  name: '', email: '', organization: '', country: '', title: '', category: '', region: 'India',
  summary: '', patientSafety: '', measures: [{ value: '', unit: UNITS[0]! }], permission: false, noPatientData: false,
}
const fmtSize = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

export function SubmitCaseForm() {
  const [state, formAction, pending] = useActionState<SubmitCaseState, FormData>(submitCaseStudy, { ok: false, errors: {} })
  const [f, setF] = useState<Fields>(EMPTY)
  const [files, setFiles] = useState<File[]>([])
  const [drag, setDrag] = useState(false)
  const [draftNote, setDraftNote] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')
  const [tsToken, setTsToken] = useState('')
  const [tsReset, setTsReset] = useState(0)
  const e = uploadError ? { ...state.errors, attachments: uploadError } : state.errors

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setF({ ...EMPTY, ...JSON.parse(saved) })
    } catch {}
  }, [])
  useEffect(() => {
    if (state.ok) {
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (Object.keys(state.errors).length) {
      document.querySelector<HTMLElement>('.pg main .inp.err, .pg main [data-err]')?.focus()
    }
  }, [state])

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setF((p) => ({ ...p, [k]: v }))
  const inp = (k: string) => (e[k] ? 'inp err' : 'inp')
  const msg = (k: string) => e[k] ? <span className="emsg" id={`${k}-err`}>{errIcon}{e[k]}</span> : null
  const described = (k: string, extra?: string) => [extra, e[k] ? `${k}-err` : ''].filter(Boolean).join(' ') || undefined
  // Copy the files right away: the input is cleared straight after, which empties its live FileList.
  const addFiles = (list: FileList | null) => {
    const picked = list ? Array.from(list) : []
    if (picked.length) setFiles((p) => [...p, ...picked])
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const fd = new FormData()
    for (const k of ['name', 'email', 'organization', 'country', 'title', 'category', 'region', 'summary', 'patientSafety'] as const) fd.set(k, f[k])
    f.measures.forEach((m) => { fd.append('measureValue', m.value); fd.append('measureUnit', m.unit) })
    if (f.permission) fd.set('permission', 'on')
    if (f.noPatientData) fd.set('noPatientData', 'on')
    startTransition(async () => {
      try {
        for (const file of files) fd.append('attachments', await toUploadable(file, 'case-attachment'))
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'The files could not be uploaded.')
        return
      }
      setUploadError('')
      fd.set('cf-turnstile-response', tsToken)
      setTsReset((n) => n + 1)
      formAction(fd)
    })
  }
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(f))
      setDraftNote('Draft saved on this device.')
    } catch {
      setDraftNote('Your browser did not allow saving a draft.')
    }
  }

  if (state.ok) {
    return (
      <div className="card pad-l stack g20" role="status">
        <div className="note note-ok"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6E3F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><path d="m5 12 5 5 9-10"></path></svg><span><strong>Thank you, your case study has been submitted.</strong>{' '}HSN will review it and may contact you with questions before it is published.</span></div>
        <div className="row g12 mstack"><Link className="btn btn-p" href="/case-studies">Back to Case Studies</Link><button type="button" className="btn btn-t" onClick={() => window.location.reload()}>Submit another</button></div>
      </div>
    )
  }

  return (
    <form className="stack g24" noValidate onSubmit={onSubmit}>
      {Object.keys(e).length > 0 && (
        <div className="note note-err" role="alert"><span style={{ color: '#B3261E', flex: 'none', marginTop: '2px' }}>{errIcon}</span><span><strong>Please check the highlighted fields.</strong>{' '}{Object.keys(e).length === 1 ? 'One answer needs' : `${Object.keys(e).length} answers need`} your attention.</span></div>
      )}
      <fieldset className="card pad-l stack g20" style={{ margin: '0' }}>
        <legend className="h4" style={{ float: 'left', width: '100%', padding: '0', marginBottom: '4px' }}>1. Your details</legend>
        <div className="grid c2" style={{ gap: '20px' }}>
          <div className="fld"><label className="lbl" htmlFor="s-name">Full Name</label><input className={inp('name')} id="s-name" autoComplete="name" placeholder="e.g., Dr. / Mr. / Ms. Full Name" value={f.name} onChange={(x) => set('name', x.target.value)} aria-invalid={!!e.name} aria-describedby={described('name')} />{msg('name')}</div>
          <div className="fld"><label className="lbl" htmlFor="s-email">Professional Email</label><input className={inp('email')} id="s-email" type="email" autoComplete="email" placeholder="e.g., name@hospital.org" value={f.email} onChange={(x) => set('email', x.target.value)} aria-invalid={!!e.email} aria-describedby={described('email')} />{msg('email')}</div>
          <div className="fld"><label className="lbl" htmlFor="s-org">Organization / Hospital Name</label><input className={inp('organization')} id="s-org" autoComplete="organization" placeholder="Facility name and city" value={f.organization} onChange={(x) => set('organization', x.target.value)} aria-invalid={!!e.organization} aria-describedby={described('organization')} />{msg('organization')}</div>
          <div className="fld"><label className="lbl" htmlFor="s-country">Country</label><span className="sel"><select className={inp('country')} id="s-country" value={f.country} onChange={(x) => set('country', x.target.value)} aria-invalid={!!e.country} aria-describedby={described('country')}><option value="">Select your country</option><option>India</option><option>UAE</option><option>Saudi Arabia</option><option>Oman</option><option>Qatar</option><option>Kuwait</option><option>Bahrain</option><option>International</option></select>{chevron}</span>{msg('country')}</div>
        </div>
      </fieldset>
      <fieldset className="card pad-l stack g20" style={{ margin: '0' }}>
        <legend className="h4" style={{ float: 'left', width: '100%', padding: '0', marginBottom: '4px' }}>2. Your project</legend>
        <div className="fld"><label className="lbl" htmlFor="s-title">Project title</label><input className={inp('title')} id="s-title" placeholder="e.g., Reducing single-use plastics in the ICU" value={f.title} onChange={(x) => set('title', x.target.value)} aria-invalid={!!e.title} aria-describedby={described('title')} />{msg('title')}</div>
        <div className="grid c2" style={{ gap: '20px' }}>
          <div className="fld"><label className="lbl" htmlFor="s-cat">Category</label><span className="sel"><select className={inp('category')} id="s-cat" value={f.category} onChange={(x) => set('category', x.target.value)} aria-invalid={!!e.category} aria-describedby={described('category')}><option value="">Select a category</option><option>Energy &amp; Decarbonization</option><option>Clinical Care &amp; SusQI</option><option>Waste Minimization</option><option>Procurement &amp; Logistics</option></select>{chevron}</span>{msg('category')}</div>
          <fieldset className="fld" style={{ border: '0', padding: '0', margin: '0' }}>
            <legend className="lbl" style={{ padding: '0', marginBottom: '6px' }}>Region</legend>
            <div className="row g20">
              {['India', 'GCC', 'International'].map((r) => (
                <label key={r} className="rad"><input type="radio" name="s-reg" checked={f.region === r} onChange={() => set('region', r)} />{r}</label>
              ))}
            </div>
            {msg('region')}
          </fieldset>
        </div>
        <div className="stack g8">
          <span className="lbl" id="s-imp">Measured impact</span>
          <span className="hint">Add at least one measured result. Use your baseline and post-change figures.</span>
          {f.measures.map((m, i) => (
            <div key={i} className="row g12 nowrap" role="group" aria-labelledby="s-imp">
              <label className="sr" htmlFor={`s-val-${i}`}>Value</label><input className={e.measures ? 'inp err' : 'inp'} id={`s-val-${i}`} inputMode="decimal" placeholder="e.g., 120" style={{ flex: '0 0 160px' }} value={m.value} onChange={(x) => set('measures', f.measures.map((mm, j) => (j === i ? { ...mm, value: x.target.value } : mm)))} aria-invalid={!!e.measures} aria-describedby={described('measures')} />
              <span className="sel grow"><label className="sr" htmlFor={`s-unit-${i}`}>Unit</label><select className="inp" id={`s-unit-${i}`} value={m.unit} onChange={(x) => set('measures', f.measures.map((mm, j) => (j === i ? { ...mm, unit: x.target.value } : mm)))}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>{chevron}</span>
              {i > 0 && (
                <button type="button" className="ico ico-bare" aria-label={`Remove measure ${i + 1}`} onClick={() => set('measures', f.measures.filter((_, j) => j !== i))}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
              )}
            </div>
          ))}
          {msg('measures')}
          {f.measures.length < 4 && (
            <button type="button" className="btn btn-t btn-sm self-start" style={{ padding: '0' }} onClick={() => set('measures', [...f.measures, { value: '', unit: UNITS[0]! }])}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Add another measure</button>
          )}
        </div>
        <div className="fld"><label className="lbl" htmlFor="s-sum">Project summary</label><textarea className={inp('summary')} id="s-sum" aria-describedby={described('summary', 's-sum-h')} aria-invalid={!!e.summary} placeholder="Describe the baseline, the change you made and how you measured the impact." value={f.summary} onChange={(x) => set('summary', x.target.value)}></textarea><span className="hint" id="s-sum-h">Up to 1,000 characters{f.summary.length > 0 ? ` · ${f.summary.length} used` : ''}</span>{msg('summary')}</div>
        <div className="fld"><label className="lbl" htmlFor="s-safe">Patient safety{' '}<span className="opt-t">(optional)</span></label><textarea className="inp" id="s-safe" style={{ minHeight: '100px' }} placeholder="How did you make sure patient safety and clinical outcomes were protected?" value={f.patientSafety} onChange={(x) => set('patientSafety', x.target.value)}></textarea></div>
        <div className="stack g8">
          <span className="lbl">Attachments{' '}<span className="opt-t">(optional)</span></span>
          <div
            className="drop"
            style={drag ? { borderColor: '#1C6E8A', background: '#DDF0F6' } : undefined}
            onDragOver={(x) => { x.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(x) => { x.preventDefault(); setDrag(false); addFiles(x.dataTransfer.files) }}
          >
            <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4"></path><path d="m7 9 5-5 5 5"></path><path d="M5 20h14"></path></svg></span>
            <span><button type="button" className="btn btn-t" style={{ padding: '0 4px', minHeight: '44px' }} onClick={() => fileInput.current?.click()}>Choose files</button>{' '}or drag them here</span>
            <span className="hint">PDF, JPG or PNG, up to 10 MB each</span>
            <input ref={fileInput} className="sr" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" tabIndex={-1} aria-hidden="true" onChange={(x) => { addFiles(x.target.files); x.target.value = '' }} />
          </div>
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="card row g12" style={{ padding: '12px 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg>
              <span className="grow small strong">{file.name}{' '}<span className="muted" style={{ fontWeight: '400' }}>· {fmtSize(file.size)}</span></span>
              <button type="button" className="ico ico-bare" aria-label={`Remove ${file.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
            </div>
          ))}
          {msg('attachments')}
        </div>
      </fieldset>
      <div className="card pad-l stack g12">
        <label className="chk"><input type="checkbox" checked={f.permission} onChange={(x) => set('permission', x.target.checked)} aria-invalid={!!e.permission} data-err={e.permission ? '' : undefined} /><span>I confirm I have permission from my organization to share this project.</span></label>
        {msg('permission')}
        <label className="chk"><input type="checkbox" checked={f.noPatientData} onChange={(x) => set('noPatientData', x.target.checked)} aria-invalid={!!e.noPatientData} /><span>The submission contains no patient-identifiable information.</span></label>
        {msg('noPatientData')}
        <div className="row g16 mstack" style={{ paddingTop: '8px' }}>
          <Turnstile onToken={setTsToken} resetKey={tsReset} />
          {msg('form')}
          <button type="submit" className="btn btn-p btn-lg" disabled={pending || (turnstileOn && !tsToken)}>{pending ? 'Submitting…' : 'Submit for review'}</button>
          <button type="button" className="btn btn-t" onClick={saveDraft}>Save draft</button>
        </div>
        {draftNote && <span className="small muted" role="status">{draftNote}</span>}
      </div>
    </form>
  )
}
