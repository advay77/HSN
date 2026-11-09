'use client'

import React, { startTransition, useActionState, useState } from 'react'

import { submitSiteFeedback, type SiteFeedbackState } from '@/app/(frontend)/(site)/feedback/actions'
import { Turnstile, turnstileOn } from '@/components/site/Turnstile'

const RATINGS = [
  { v: '5', label: 'Excellent' },
  { v: '4', label: 'Good' },
  { v: '3', label: 'Okay' },
  { v: '2', label: 'Poor' },
  { v: '1', label: 'Very poor' },
]

/** Short feedback form for any public page. */
export function SiteFeedbackForm({ page, signedIn = false }: { page: string; signedIn?: boolean }) {
  const [state, action, pending] = useActionState<SiteFeedbackState, FormData>(submitSiteFeedback, { ok: false })
  const [rating, setRating] = useState('')
  const [tsToken, setTsToken] = useState('')
  const [tsReset, setTsReset] = useState(0)

  if (state.ok) {
    return (
      <div className="note note-ok" role="status">
        <span><b>Thank you for your feedback.</b> The HSN team reads every message.</span>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('rating', rating)
    fd.set('page', page)
    fd.set('cf-turnstile-response', tsToken)
    setTsReset((n) => n + 1)
    startTransition(() => action(fd))
  }

  return (
    <form className="stack g16" onSubmit={onSubmit} noValidate>
      <fieldset className="stack g8" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="lbl" style={{ padding: 0, marginBottom: '8px' }}>How was your experience? <span className="muted">(optional)</span></legend>
        <div className="row g8" style={{ flexWrap: 'wrap' }}>
          {RATINGS.map((r) => (
            <button key={r.v} type="button" className={rating === r.v ? 'chp on' : 'chp'} aria-pressed={rating === r.v} onClick={() => setRating(rating === r.v ? '' : r.v)}>{r.label}</button>
          ))}
        </div>
      </fieldset>
      <div className="fld">
        <label className="lbl" htmlFor="sf-msg">Your feedback</label>
        <textarea className="inp" id="sf-msg" name="message" rows={4} required maxLength={4000} placeholder="What did you like, what can we improve, or what would you like to see on this website?" />
      </div>
      {!signedIn && (
        <div className="grid c2 t1 g16">
          <div className="fld"><label className="lbl" htmlFor="sf-name">Name <span className="muted">(optional)</span></label><input className="inp" id="sf-name" name="name" autoComplete="name" maxLength={200} /></div>
          <div className="fld"><label className="lbl" htmlFor="sf-email">Email <span className="muted">(optional, if you want a reply)</span></label><input className="inp" id="sf-email" name="email" type="email" autoComplete="email" maxLength={200} /></div>
        </div>
      )}
      {/* Hidden from people; bots fill it in. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="sf-web">Website</label><input id="sf-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Turnstile onToken={setTsToken} resetKey={tsReset} />
      {state.error && <div className="note note-err" role="alert"><span>{state.error}</span></div>}
      <div className="row g12" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="submit" className="btn btn-p" disabled={pending || (turnstileOn && !tsToken)}>{pending ? 'Sending…' : 'Send feedback'}</button>
        <span className="small muted">We use your feedback only to improve HSN. See our <a href="/privacy">Privacy Policy</a>.</span>
      </div>
    </form>
  )
}
