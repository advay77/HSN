'use client'

import React, { startTransition, useActionState, useMemo, useState } from 'react'

import '@/app/(frontend)/styles/pages/site-feedback.css'

import { submitSiteFeedback, type SiteFeedbackState } from '@/app/(frontend)/(site)/feedback/actions'
import { Turnstile, turnstileOn } from '@/components/site/Turnstile'
import { ASPECTS, OVERALL_LABELS, ROLES, SOURCES, WANTS } from '@/lib/siteFeedback'

const Star = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={on ? 'sfb-star on' : 'sfb-star'}>
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
  </svg>
)

/** Five stars as a radio group: arrow keys move between them, the label says the value. */
function Stars({ name, value, onChange, size = 'md', label }: { name: string; value: number; onChange: (v: number) => void; size?: 'md' | 'lg'; label: string }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <span className={`sfb-stars ${size}`} role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} onMouseEnter={() => setHover(n)} title={`${n} of 5`}>
          <input className="sr" type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} aria-label={`${n} of 5${size === 'lg' ? ` – ${OVERALL_LABELS[String(n)]}` : ''}`} />
          <Star on={n <= shown} />
        </label>
      ))}
    </span>
  )
}

/** Full website feedback form for the /feedback page. */
export function SiteFeedbackForm({ page }: { page: string }) {
  const [state, action, pending] = useActionState<SiteFeedbackState, FormData>(submitSiteFeedback, { ok: false })
  const [rating, setRating] = useState(0)
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [nps, setNps] = useState<number | null>(null)
  const [wants, setWants] = useState<string[]>([])
  const [improve, setImprove] = useState('')
  const [tsToken, setTsToken] = useState('')
  const [tsReset, setTsReset] = useState(0)

  // How much of the form is filled in, for the progress bar.
  const progress = useMemo(() => {
    const parts = [rating > 0, Object.keys(aspects).length >= 4, nps !== null, improve.trim().length >= 3, wants.length > 0]
    return Math.round((parts.filter(Boolean).length / parts.length) * 100)
  }, [rating, aspects, nps, improve, wants])

  if (state.ok) {
    return (
      <div className="sfb-done" role="status">
        <span className="sfb-done-ic" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg></span>
        <h2 className="h3" style={{ margin: 0 }}>Thank you for your feedback</h2>
        <p className="muted" style={{ margin: 0, maxWidth: '520px' }}>The HSN team reads every response. Your answers help us decide which courses, case studies and resources to build next.</p>
        <a className="btn btn-s" href="/">Back to the home page</a>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('page', page)
    fd.set('cf-turnstile-response', tsToken)
    setTsReset((n) => n + 1)
    startTransition(() => action(fd))
  }
  // A question's error disappears as soon as the answer is fixed.
  const stillWrong = (f?: string) => (f === 'rating' ? rating === 0 : f === 'message' ? improve.trim().length < 3 : !!f)
  const err = (f: string) => (state.field === f && state.error && stillWrong(f) ? <span className="emsg" role="alert">{state.error}</span> : null)

  return (
    <form className="sfb" onSubmit={onSubmit} noValidate>
      <div className="sfb-prog" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <p className="small muted sfb-prog-t" aria-live="polite">{progress === 100 ? 'All done – ready to send.' : `${progress}% complete · takes about 3 minutes`}</p>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">1</span>Overall, how would you rate your experience with HSN? <span className="req" aria-hidden="true">*</span></legend>
        <div className="row g16" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Stars name="rating" value={rating} onChange={setRating} size="lg" label="Overall rating" />
          <span className="sfb-rlabel" aria-hidden="true">{rating ? OVERALL_LABELS[String(rating)] : 'Tap a star'}</span>
        </div>
        {err('rating')}
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">2</span>How would you rate each part of the website?</legend>
        <p className="small muted" style={{ margin: 0 }}>1 star = needs a lot of work, 5 stars = excellent. Skip anything you have not used.</p>
        <div className="sfb-aspects">
          {ASPECTS.map((a) => (
            <div className="sfb-aspect" key={a.key}>
              <span>{a.label}</span>
              <Stars name={`aspect-${a.key}`} value={aspects[a.key] ?? 0} onChange={(v) => setAspects((x) => ({ ...x, [a.key]: v }))} label={a.label} />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">3</span>How likely are you to recommend HSN to a colleague?</legend>
        <div className="sfb-nps" role="radiogroup" aria-label="Likelihood to recommend, 0 to 10">
          {Array.from({ length: 11 }, (_, n) => (
            <label key={n} className={nps === n ? 'on' : ''}>
              <input className="sr" type="radio" name="nps" value={n} checked={nps === n} onChange={() => setNps(n)} />
              <span>{n}</span>
            </label>
          ))}
        </div>
        <div className="row between small muted"><span>Not likely</span><span>Very likely</span></div>
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">4</span>What did you like most?</legend>
        <label className="sr" htmlFor="sf-liked">What did you like most?</label>
        <textarea className="inp" id="sf-liked" name="liked" rows={3} maxLength={4000} placeholder="For example a course, a case study, the design, or how easy something was to find." />
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">5</span>What should we improve? <span className="req" aria-hidden="true">*</span></legend>
        <label className="sr" htmlFor="sf-msg">What should we improve?</label>
        <textarea className="inp" id="sf-msg" name="message" rows={4} required maxLength={4000} value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="Anything that was confusing, missing, slow or hard to use." aria-invalid={state.field === 'message' || undefined} />
        {err('message')}
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">6</span>What would you like to see from HSN next? <span className="muted" style={{ fontWeight: 400 }}>(choose any)</span></legend>
        <div className="sfb-chips">
          {WANTS.map((w) => {
            const on = wants.includes(w)
            return (
              <label key={w} className={on ? 'chp on' : 'chp'}>
                <input className="sr" type="checkbox" name="wants" value={w} checked={on} onChange={() => setWants((x) => (on ? x.filter((y) => y !== w) : [...x, w]))} />
                {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>}
                {w}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="sfb-q">
        <legend><span className="sfb-n">7</span>A little about you</legend>
        <div className="grid c2 t1 g16">
          <div className="fld"><label className="lbl" htmlFor="sf-role">Your role</label><span className="sel"><select className="inp" id="sf-role" name="role" defaultValue=""><option value="">Choose one (optional)</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span></div>
          <div className="fld"><label className="lbl" htmlFor="sf-src">How did you find HSN?</label><span className="sel"><select className="inp" id="sf-src" name="source" defaultValue=""><option value="">Choose one (optional)</option>{SOURCES.map((r) => <option key={r}>{r}</option>)}</select><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span></div>
        </div>
      </fieldset>

      {/* Hidden from people; bots fill it in. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="sf-web">Website</label><input id="sf-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sfb-send">
        <Turnstile onToken={setTsToken} resetKey={tsReset} />
        {state.error && !state.field && <div className="note note-err" role="alert"><span>{state.error}</span></div>}
        {state.field && stillWrong(state.field) && <p className="emsg" role="alert" style={{ margin: 0 }}>Please check the highlighted question above.</p>}
        <div className="row g16" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="submit" className="btn btn-p btn-lg" disabled={pending || (turnstileOn && !tsToken)}>{pending ? 'Sending…' : 'Send feedback'}</button>
          <span className="small muted">Questions marked <span className="req">*</span> are required. We use your answers only to improve HSN (<a href="/privacy">Privacy Policy</a>).</span>
        </div>
      </div>
    </form>
  )
}
