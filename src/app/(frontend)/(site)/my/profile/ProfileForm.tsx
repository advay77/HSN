'use client'

import React, { useActionState, useRef } from 'react'

import { saveProfile, type ProfileState } from './actions'

const CODES = ['IN +91', 'AE +971', 'SA +966', 'OM +968', 'QA +974', 'KW +965', 'BH +973', 'US +1', 'GB +44', 'CA +1', 'AU +61', 'SG +65', 'DE +49', 'FR +33', 'PK +92', 'BD +880', 'LK +94', 'NP +977', 'EG +20', 'JO +962']
const COUNTRIES = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']
const COUNTRY_NAME: Record<string, string> = { IN: 'India', AE: 'UAE', SA: 'Saudi Arabia', OM: 'Oman', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain' }
/** Defaults for a member who has not saved these yet: the country they are visiting from, else India. */
const defaultsFor = (geo?: string | null) => {
  const g = (geo || '').toUpperCase()
  return {
    code: CODES.find((c) => c.startsWith(g + ' ')) ?? 'IN +91',
    country: COUNTRY_NAME[g] ?? (g ? 'International' : 'India'),
  }
}

export type ProfileValues = { name: string; email: string; phoneCountryCode: string; phone: string; role: string; organization: string; country: string }

export function ProfileForm({ values, geo }: { values: ProfileValues; geo?: string | null }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {})
  const formRef = useRef<HTMLFormElement>(null)
  const err = (f: string) => (state.field === f ? 'inp err' : 'inp')

  return (
    <>
      {state.saved && (
        <div className="note note-ok" role="status"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6E3F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><path d="m5 12 5 5 9-10"></path></svg><span><strong>Profile saved.</strong>{' '}Your changes are live.</span></div>
      )}
      <form ref={formRef} action={action} className="card pad-l stack g20" aria-labelledby="pd" noValidate>
        <h2 className="h3" id="pd">Personal and Professional Details</h2>
        <div className="grid c2" style={{ gap: '20px' }}>
          <div className="fld"><label className="lbl" htmlFor="p-name">Full Name</label><input className={err('name')} id="p-name" name="name" autoComplete="name" defaultValue={values.name} /></div>
          <div className="fld"><label className="lbl" htmlFor="p-email">Professional Email</label><input className={err('email')} id="p-email" name="email" type="email" autoComplete="email" defaultValue={values.email} readOnly aria-readonly="true" /><span className="hint">Used to log in. To change it, contact HSN.</span></div>
          <div className="fld"><label className="lbl" htmlFor="p-phone">Phone Number</label>
            <div className="phone"><span className="sel cc"><label className="sr" htmlFor="p-cc">Country code</label><select className="inp" id="p-cc" name="phoneCountryCode" style={{ fontWeight: 600 }} defaultValue={values.phoneCountryCode || defaultsFor(geo).code}>{CODES.map((c) => <option key={c}>{c}</option>)}</select><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></span><input className="inp grow" id="p-phone" name="phone" type="tel" autoComplete="tel-national" defaultValue={values.phone} /></div></div>
          <div className="fld"><label className="lbl" htmlFor="p-role">Job Title / Role</label><input className="inp" id="p-role" name="role" autoComplete="organization-title" defaultValue={values.role} /></div>
          <div className="fld"><label className="lbl" htmlFor="p-org">Organization / Hospital Name</label><input className="inp" id="p-org" name="organization" autoComplete="organization" defaultValue={values.organization} /></div>
          <div className="fld"><label className="lbl" htmlFor="p-country">Country</label><span className="sel"><select className="inp" id="p-country" name="country" defaultValue={values.country || defaultsFor(geo).country}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></span></div>
        </div>
        {state.error && (
          <span className="emsg" role="alert"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5M12 16.5v.01"></path></svg><span>{state.error}</span></span>
        )}
        <div className="row g12 mstack"><button className="btn btn-p" type="submit" disabled={pending}>Save changes</button><button className="btn btn-t" type="button" onClick={() => formRef.current?.reset()}>Cancel</button></div>
      </form>
    </>
  )
}
