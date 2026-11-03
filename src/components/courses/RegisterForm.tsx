'use client'

// Form and success states of Register.dc.html, wired to the registerForCourse server action.
import React, { useRef, useState, useTransition } from 'react'

import { registerForCourse, type RegisterInput } from '@/lib/courses/actions'

type Errors = Partial<Record<keyof RegisterInput, string>>

const ErrIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 16.5h.01"></path></svg>
)
const Tick = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>
)

const FIELD_LABEL: Partial<Record<keyof RegisterInput, [string, string]>> = {
  name: ['r-name', 'Full Name'],
  email: ['r-email', 'Professional Email'],
  phone: ['r-phone', 'Phone Number'],
  role: ['r-role', 'Job Title / Role'],
  organization: ['r-org', 'Organization / Hospital Name'],
  country: ['r-country', 'Country'],
  session: ['r-session', 'Session / Preferred Date'],
}

export function RegisterForm({
  courseSlug,
  courseTitle,
  courseHref,
  sessions,
  defaults,
}: {
  courseSlug: string
  courseTitle: string
  courseHref: string
  sessions: string[]
  defaults: { name: string; email: string }
}) {
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<null | { email: string; emailed: boolean; session: string; network: boolean }>(null)
  const [pending, start] = useTransition()
  const alertRef = useRef<HTMLDivElement>(null)
  const errCount = Object.keys(errors).length
  const cls = (k: keyof RegisterInput) => (errors[k] ? 'inp err' : 'inp')
  const msg = (k: keyof RegisterInput, id?: string) =>
    errors[k] ? (<span className="emsg" id={id}><ErrIcon />{errors[k]}</span>) : null

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const input: RegisterInput = {
      courseSlug,
      name: String(f.get('name') || ''),
      email: String(f.get('email') || ''),
      phoneCode: String(f.get('cc') || ''),
      phone: String(f.get('phone') || ''),
      role: String(f.get('role') || ''),
      organization: String(f.get('org') || ''),
      country: String(f.get('country') || ''),
      session: String(f.get('session') || ''),
      joinNetwork: f.get('network') === 'on',
    }
    start(async () => {
      const r = await registerForCourse(input)
      if (r.ok) {
        setDone({ email: input.email.trim(), emailed: r.emailed, session: r.session, network: input.joinNetwork })
        window.scrollTo({ top: 0 })
      } else {
        setErrors(r.errors)
        setTimeout(() => alertRef.current?.focus(), 0)
      }
    })
  }

  if (done) {
    return (
      <div className="card pad-l stack g24" role="status">
        <span className="ic" style={{ width: '72px', height: '72px', borderRadius: '999px', background: '#E3F1E4', color: '#1B6E3F' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></span>
        <div className="stack g8">
          <h1 className="h1">You’re registered</h1>
          {done.emailed ? (
            <p className="lead">We’ve sent a confirmation to{' '}<strong>{done.email}</strong>{' '}with the session details.</p>
          ) : (
            <p className="lead">We’ll email{' '}<strong>{done.email}</strong>{' '}with the session details.</p>
          )}
        </div>
        <dl className="card" style={{ background: '#F5F1E6', padding: '20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 24px' }}>
          <dt className="small muted strong">Course</dt><dd>{courseTitle}</dd>
          {done.session && (<><dt className="small muted strong">Session</dt><dd>{done.session}</dd></>)}
          {done.network && (<><dt className="small muted strong">Network</dt><dd>Added to the HSN WhatsApp/LinkedIn Network</dd></>)}
        </dl>
        <div className="stack g12">
          <h2 className="h4">What Happens Next</h2>
          <ul className="ticks">
            <li><Tick />Joining instructions arrive by email before the session.</li>
            {done.network && <li><Tick />You’ll receive the community invite on WhatsApp or LinkedIn.</li>}
          </ul>
        </div>
        <div className="row g12 mstack">
          <a className="btn btn-p" href={courseHref}>Back to the course</a>
          <a className="btn btn-s" href="/courses">Explore more courses</a>
        </div>
      </div>
    )
  }

  return (
    <div className="card pad-l stack g24">
      <div className="stack g8">
        <span className="over">Course registration</span>
        <h1 className="h1">Register for the Course</h1>
        <p className="muted">All fields are required unless marked optional. It takes about two minutes.</p>
      </div>
      {errCount > 0 && (
        <div className="note note-err" role="alert" tabIndex={-1} ref={alertRef}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 16.5h.01"></path></svg>
          <div className="stack g4"><strong style={{ color: '#B3261E' }}>{errCount} {errCount === 1 ? 'field needs' : 'fields need'} attention</strong>
            {(Object.keys(errors) as (keyof RegisterInput)[]).map((k) =>
              FIELD_LABEL[k] ? <a key={k} href={`#${FIELD_LABEL[k]![0]}`}>{FIELD_LABEL[k]![1]}</a> : <span key={k}>{errors[k]}</span>,
            )}
          </div>
        </div>
      )}
      <form className="stack g20" noValidate onSubmit={onSubmit}>
        <div className="fld">
          <label className="lbl" htmlFor="r-name">Full Name</label>
          <input className={cls('name')} id="r-name" name="name" autoComplete="name" placeholder="e.g., Dr. / Mr. / Ms. Full Name" defaultValue={defaults.name} aria-invalid={!!errors.name} />
          {msg('name')}
        </div>
        <div className="fld">
          <label className="lbl" htmlFor="r-email">Professional Email</label>
          <input className={cls('email')} id="r-email" name="email" type="email" autoComplete="email" placeholder="e.g., name@hospital.org" defaultValue={defaults.email} aria-invalid={!!errors.email} aria-describedby="r-email-e" />
          {msg('email', 'r-email-e')}
        </div>
        <div className="fld">
          <label className="lbl" htmlFor="r-phone">Phone Number</label>
          <div className="phone">
            <span className="sel cc">
              <label className="sr" htmlFor="r-cc">Country code</label>
              <select className={cls('phone')} id="r-cc" name="cc" style={{ fontWeight: '600' }}>
                <option>IN +91</option><option>AE +971</option><option>SA +966</option><option>OM +968</option><option>QA +974</option><option>KW +965</option><option>BH +973</option><option>Other</option>
              </select>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
            <input className={`${cls('phone')} grow`} id="r-phone" name="phone" type="tel" autoComplete="tel-national" placeholder="98XXX XXXXX" aria-invalid={!!errors.phone} aria-describedby="r-phone-h" />
          </div>
          {msg('phone')}
          <span className="hint" id="r-phone-h">Examples: +91 98XXX XXXXX · +971 50 XXX XXXX</span>
        </div>
        <div className="grid c2" style={{ gap: '20px' }}>
          <div className="fld">
            <label className="lbl" htmlFor="r-role">Job Title / Role</label>
            <input className={cls('role')} id="r-role" name="role" autoComplete="organization-title" placeholder="e.g., Quality Manager, Medical Director" aria-invalid={!!errors.role} />
            {msg('role')}
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="r-org">Organization / Hospital Name</label>
            <input className={cls('organization')} id="r-org" name="org" autoComplete="organization" placeholder="Facility name and city" aria-invalid={!!errors.organization} />
            {msg('organization')}
          </div>
        </div>
        <div className={sessions.length ? 'grid c2' : 'grid'} style={{ gap: '20px' }}>
          <div className="fld">
            <label className="lbl" htmlFor="r-country">Country</label>
            <span className="sel">
              <select className={cls('country')} id="r-country" name="country" aria-invalid={!!errors.country} defaultValue="">
                <option value="">Select your country</option>
                <option>India</option><option>UAE</option><option>Saudi Arabia</option><option>Oman</option><option>Qatar</option><option>Kuwait</option><option>Bahrain</option><option>International</option>
              </select>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
            {msg('country')}
          </div>
          {sessions.length > 0 && (
            <div className="fld">
              <label className="lbl" htmlFor="r-session">Session / Preferred Date</label>
              <span className="sel">
                <select className={cls('session')} id="r-session" name="session" aria-invalid={!!errors.session} defaultValue="">
                  <option value="">Select upcoming cohort or webinar date</option>
                  {sessions.map((s) => <option key={s}>{s}</option>)}
                </select>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </span>
              {msg('session')}
            </div>
          )}
        </div>
        <label className="chk"><input type="checkbox" name="network" defaultChecked={true} /><span>Yes, add me to the HSN WhatsApp/LinkedIn Network</span></label>
        <div className="row g16 mstack" style={{ paddingTop: '4px' }}>
          <button type="submit" className="btn btn-p btn-lg" disabled={pending}>{pending ? 'Submitting…' : 'Submit'}</button>
          <span className="small muted">By submitting you agree to our{' '}<a href="/privacy">Privacy Policy</a>.</span>
        </div>
      </form>
    </div>
  )
}
