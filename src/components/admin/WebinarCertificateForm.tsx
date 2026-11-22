'use client'

import React, { useActionState } from 'react'

import { issueWebinarCertificate, type WebinarFormState } from '@/app/(frontend)/admin/certificates/webinar/actions'

const initial: WebinarFormState = {}

export function WebinarCertificateForm() {
  const [state, action, pending] = useActionState(issueWebinarCertificate, initial)
  return (
    <form action={action} className="card pad stack g16" style={{ maxWidth: '760px' }}>
      {state.error && <div className="note note-err" role="alert"><span>{state.error}</span></div>}
      <fieldset className="stack g12" style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="lbl">Certificate</legend>
        <div className="seg self-start" role="group" aria-label="Certificate">
          <label className="row g8"><input type="radio" name="role" value="moderator" defaultChecked /> Moderator</label>
          <label className="row g8"><input type="radio" name="role" value="speaker" /> Speaker</label>
        </div>
      </fieldset>
      <div className="fld"><label className="lbl" htmlFor="wc-name">Person’s name</label><input className="inp" id="wc-name" name="recipient" required /></div>
      <div className="fld"><label className="lbl" htmlFor="wc-web">Webinar title</label><input className="inp" id="wc-web" name="webinar" required /></div>
      <div className="fld"><label className="lbl" htmlFor="wc-date">Date</label><input className="inp" id="wc-date" name="heldOn" placeholder="22 November 2026" required /></div>
      <div className="grid c2" style={{ gap: '16px' }}>
        <div className="fld"><label className="lbl" htmlFor="wc-ln">Left signature name</label><input className="inp" id="wc-ln" name="leftName" defaultValue="Dr. Nishant Jaiswal" required /></div>
        <div className="fld"><label className="lbl" htmlFor="wc-lt">Left signature title</label><input className="inp" id="wc-lt" name="leftTitle" defaultValue="Founder" required /></div>
        <div className="fld"><label className="lbl" htmlFor="wc-rn">Right signature name</label><input className="inp" id="wc-rn" name="rightName" required /></div>
        <div className="fld"><label className="lbl" htmlFor="wc-rt">Right signature title</label><input className="inp" id="wc-rt" name="rightTitle" required /></div>
      </div>
      <button className="btn btn-p" disabled={pending}>{pending ? 'Issuing…' : 'Issue certificate'}</button>
    </form>
  )
}
