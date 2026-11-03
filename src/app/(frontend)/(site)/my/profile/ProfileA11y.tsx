'use client'

// "Saved Accessibility Settings" on the Profile page: shows the settings chosen in the accessibility panel.
import React, { useSyncExternalStore } from 'react'

import { OPEN_A11Y_EVENT } from '@/components/site/FooterA11yLink'
import { activeKeys, effective, getSaved, getServerSaved, NAMES, PROFILES, subscribe, updateSaved, type Settings } from '@/lib/a11y/settings'

const SIZES = ['', '112%', '125%', '140%', '160%']
const STEPPED: (keyof Settings)[] = ['lineH', 'letterS', 'wordS']

export function ProfileA11y() {
  const saved = useSyncExternalStore(subscribe, getSaved, getServerSaved)
  const s = effective(saved)
  const keys = activeKeys(s) as (keyof Settings)[]
  const profile = saved.profile !== 'none' ? PROFILES[saved.profile] : undefined
  const chip = (k: keyof Settings) => (STEPPED.includes(k) ? `${NAMES[k]} ${s[k]}` : NAMES[k])

  return (
    <section className="card pad-l stack g16" aria-labelledby="as">
      <div className="row between g12">
        <h2 className="h3" id="as">Saved Accessibility Settings</h2>
        <span className="bdg b-info">Saved on this device</span>
      </div>
      <p className="muted">Change them from the accessibility button in the header.</p>
      {keys.length === 0 ? (
        <p className="muted">No accessibility settings are on.</p>
      ) : (
        <div className="pf on" style={{ margin: 0 }}>
          <div className="pf-top"><span className="pf-n">{profile ? `${profile.name} profile` : 'Your settings'}</span><span className="bdg b-ok">On</span></div>
          <div className="pf-chips">{keys.map((k) => <span className="pf-chip" key={k}>{chip(k)}</span>)}</div>
        </div>
      )}
      <div className="kv"><span className="strong">Bigger text</span><span className="muted">{s.size ? `Step ${s.size} · ${SIZES[s.size]}` : 'Off'}</span><span></span></div>
      <div className="kv"><span className="strong">Read aloud voice</span><span className="muted">{(saved.voice || 'en') === 'ar' ? 'Arabic' : saved.voice === 'hi' ? 'Hindi' : 'English'} · {saved.speed || '1x'}</span><span></span></div>
      <div className="kv"><span className="strong">Website language</span><span className="muted">English</span><span></span></div>
      <div className="row g12 mstack" style={{ paddingTop: '8px' }}>
        <button className="btn btn-s" type="button" onClick={() => window.dispatchEvent(new Event(OPEN_A11Y_EVENT))}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg>Open accessibility panel</button>
        <button className="btn btn-t" type="button" onClick={() => updateSaved({ profile: 'none', ov: {} })} disabled={keys.length === 0}>Clear saved settings</button>
      </div>
    </section>
  )
}
