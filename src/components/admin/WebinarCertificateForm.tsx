'use client'

import Link from 'next/link'
import React, { useActionState } from 'react'

import { issueWebinarCertificate, type WebinarFormState } from '@/app/(frontend)/admin/certificates/webinar/actions'

const initial: WebinarFormState = {}

export function WebinarCertificateForm({ nextNo }: { nextNo: string }) {
  const [state, action, pending] = useActionState(issueWebinarCertificate, initial)
  return (
    <form action={action} className="card pad stack g16" style={{ maxWidth: '760px' }}>
      {state.error && (
        <div className="note note-err" role="alert">
          <span className="stack g8">
            <span>{state.error}</span>
            {state.existing && <Link className="btn btn-p btn-sm self-start" href={`/admin/certificates/webinar/${state.existing.id}`}>Open {state.existing.number}</Link>}
          </span>
        </div>
      )}
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
      <p className="small muted" style={{ margin: 0 }}>This certificate will be No. {nextNo}. The next one continues from there. Only the founder signs, on the right.</p>
      <div className="grid c2" style={{ gap: '16px' }}>
        <div className="fld"><label className="lbl" htmlFor="wc-rn">Founder name</label><input className="inp" id="wc-rn" name="rightName" defaultValue="Dr. Nishant Jaiswal" required /></div>
        <div className="fld"><label className="lbl" htmlFor="wc-rt">Founder title</label><input className="inp" id="wc-rt" name="rightTitle" defaultValue="Founder" required /></div>
      </div>
      <button className="btn btn-p" disabled={pending}>{pending ? 'Issuing…' : 'Issue certificate'}</button>
    </form>
  )
}
