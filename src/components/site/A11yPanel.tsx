'use client'

// Ported from A11yPanel.dc.html. Markup, classes and inline styles match the design; the tools work for real
// (see src/lib/a11y and A11yEffects, which applies them to the page).
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useSyncExternalStore } from 'react'

import { getReader, getServerReader, setReaderOptions, speechSupported, startReading, stopReading, subscribeReader, togglePause } from '@/lib/a11y/reader'
import { activeKeys, effective, getSaved, getServerSaved, NAMES, PROFILES, subscribe, updateSaved, type Align, type Settings } from '@/lib/a11y/settings'

const SPEEDS = ['0.75x', '1x', '1.25x', '1.5x']
const sizes = ['', '112%', '125%', '140%', '160%']
const kbd = { fontFamily: 'inherit', padding: '1px 6px', border: '1px solid #7A8580', borderRadius: '4px' } as const
const OTHER_LANGS: [string, string][] = [
  ['ur', 'اردو · Urdu'],
  ['bn', 'বাংলা · Bengali'],
  ['ml', 'മലയാളം · Malayalam'],
  ['ta', 'தமிழ் · Tamil'],
  ['fr', 'Français'],
  ['tl', 'Filipino'],
]

type Item = {
  id: string
  name: string
  sub: string
  g: string
  kind: 'toggle' | 'steps' | 'seg'
  on: boolean
  toggle?: () => void
  opts?: { label: string; on: boolean; pick: () => void }[]
}

type OutlineEntry = { tag: string; text: string; lvl: number; el: HTMLElement }

function readOutline(): { heads: OutlineEntry[]; links: OutlineEntry[] } {
  const main = document.querySelector('main')
  if (!main) return { heads: [], links: [] }
  const heads = Array.from(main.querySelectorAll<HTMLElement>('h1, h2, h3'))
    .filter((el) => el.offsetParent !== null && el.textContent?.trim())
    .map((el) => ({ tag: el.tagName, text: el.textContent!.trim(), lvl: el.tagName === 'H1' ? 0 : el.tagName === 'H2' ? 1 : 2, el }))
  const links = Array.from(document.querySelectorAll<HTMLElement>('.pg a[href]'))
    .filter((el) => el.offsetParent !== null && el.textContent?.trim())
    .map((el) => ({ tag: 'A', text: el.textContent!.trim(), lvl: 0, el }))
  return { heads, links }
}

export function A11yPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const saved = useSyncExternalStore(subscribe, getSaved, getServerSaved)
  const reader = useSyncExternalStore(subscribeReader, getReader, getServerReader)
  const [tab, setTab] = useState<'tools' | 'profiles' | 'translate'>('tools')
  const [structOpen, setStructOpen] = useState(false)
  const [structMode, setStructMode] = useState<'heads' | 'links'>('heads')
  const [outline, setOutline] = useState<{ heads: OutlineEntry[]; links: OutlineEntry[] }>({ heads: [], links: [] })
  const [lang, setLang] = useState<'en' | 'hi' | 'ar'>('en')

  useEffect(() => {
    setLang(document.documentElement.lang === 'ar' || location.pathname.startsWith('/ar') ? 'ar' : 'en')
  }, [])
  useEffect(() => {
    if (structOpen) setOutline(readOutline())
  }, [structOpen])

  const profile = saved.profile
  const s = effective(saved)
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => updateSaved({ ov: { ...saved.ov, [k]: v } })
  const speed = saved.speed || '1x'
  const voice = saved.voice || 'en'
  const readOpts = (sp = speed, vo = voice) => ({ rate: parseFloat(sp), lang: vo })

  const tog = (k: keyof Settings, name: string, sub: string, g: string): Item => ({
    id: 't-' + k, name, sub, g, kind: 'toggle', on: !!s[k], toggle: () => set(k, !s[k] as never),
  })
  const steps = (k: 'size' | 'lineH' | 'letterS' | 'wordS', name: string, sub: string, g: string, n: number): Item => {
    const opts = []
    for (let i = 0; i <= n; i++) opts.push({ label: i === 0 ? 'Off' : String(i), on: s[k] === i, pick: () => set(k, i) })
    return { id: 't-' + k, name, sub: s[k] ? sub.replace('#', String(s[k])) : 'Off', g, kind: 'steps', on: s[k] > 0, opts }
  }
  const alignOpts = ([['off', 'Off'], ['left', 'Left'], ['center', 'Center'], ['justify', 'Justify']] as [Align, string][]).map(([v, l]) => ({
    label: l, on: s.align === v, pick: () => set('align', v),
  }))
  const groups: { title: string; isRead?: boolean; isNav?: boolean; items: Item[] }[] = [
    {
      title: 'Text',
      items: [
        { ...steps('size', 'Bigger text', 'Step # of 4', 'A+', 4), sub: s.size ? 'Text at ' + sizes[s.size] : 'Off' },
        tog('readable', 'Readable font', 'Atkinson Hyperlegible', 'Aa'),
        tog('dys', 'Dyslexia-friendly font', 'Lexend', 'Dy'),
        steps('lineH', 'Line spacing', 'Step # of 3', '≡', 3),
        steps('letterS', 'Letter spacing', 'Step # of 3', 'A B', 3),
        steps('wordS', 'Word spacing', 'Step # of 3', 'W W', 3),
        {
          id: 't-align', name: 'Text align',
          sub: s.align === 'off' ? 'As designed' : 'All text ' + (s.align === 'center' ? 'centered' : s.align === 'justify' ? 'justified' : 'left-aligned'),
          g: '⇤', kind: 'seg', on: s.align !== 'off', opts: alignOpts,
        },
      ],
    },
    {
      title: 'Color',
      items: [
        tog('contrast', 'High contrast', 'Black background, white and yellow text', '◐'),
        tog('dark', 'Dark mode', 'Dark teal theme', 'D'),
        tog('lowsat', 'Low saturation', 'Softer colors', 'S−'),
        tog('grey', 'Greyscale', 'No color', 'G'),
        tog('highsat', 'High saturation', 'Stronger colors', 'S+'),
        tog('cb', 'Color-blind-safe colors', 'Blue and orange instead of red and green', 'CB'),
      ],
    },
    {
      title: 'Reading aids',
      items: [
        tog('links', 'Highlight links', 'Underline and outline every link', 'L'),
        tog('heads', 'Highlight headings', 'Outline every heading', 'H'),
        tog('guide', 'Reading guide', 'A line that follows your pointer', '—'),
        tog('mask', 'Reading mask', 'Dims everything but the line you read', '▭'),
        tog('hideImg', 'Hide images', 'Show text descriptions instead', 'Img'),
      ],
    },
    { title: 'Read aloud', isRead: true, items: [] },
    {
      title: 'Motion and navigation',
      isNav: true,
      items: [
        tog('pause', 'Pause animations', 'Stops movement and auto-play', 'II'),
        tog('cursor', 'Big cursor', 'Large, high-contrast pointer', '↖'),
        tog('focus', 'Strong keyboard focus outline', 'Thick yellow and teal ring', '[ ]'),
        tog('targets', 'Larger click areas', 'Buttons and links at least 56 px', '⊕'),
      ],
    },
  ]

  const onKeys = activeKeys(s)
  const countLabel = onKeys.length
    ? onKeys.length + (onKeys.length === 1 ? ' setting on' : ' settings on') + (profile !== 'none' && PROFILES[profile] ? ' · ' + PROFILES[profile].name + ' profile' : '')
    : 'No settings on'
  const playing = reader.status === 'playing'
  const supported = typeof window !== 'undefined' && speechSupported()
  const readState = !supported ? 'Not supported' : playing ? 'Reading' : reader.status === 'paused' ? 'Paused' : 'Ready'
  const readBadgeStyle = playing ? { background: '#5BC0E3', color: '#0E1F22' } : { background: '#0F4251', color: '#F5F1E6' }

  const play = () => startReading(null, readOpts())
  const playPause = () => {
    setReaderOptions(readOpts())
    togglePause()
  }
  const reset = () => {
    stopReading()
    updateSaved({ profile: 'none', ov: {} })
  }
  const outlineList = structMode === 'heads' ? outline.heads : outline.links

  return (
    <div className="ap" role="dialog" aria-modal="false" aria-labelledby="ap-t" style={{ width: '100%', maxWidth: '440px', minHeight: '100%' }}>
      <div className="ap-head">
        <div className="stack g4">
          <h2 className="ap-title" id="ap-t">
            <span className="a11y" style={{ width: '36px', height: '36px' }} aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg></span>{' '}Accessibility</h2>
          <span className="tool-s" role="status">{countLabel}</span>
        </div>
        <button className="ico" aria-label="Close accessibility options (Esc)" onClick={onClose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
      </div>
      <div className="ap-tabs" role="tablist" aria-label="Accessibility sections">
        {([['tools', 'Tools'], ['profiles', 'Profiles'], ['translate', 'Translate']] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? 'ap-tab on' : 'ap-tab'} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* TOOLS */}
      {tab === 'tools' && (
        <div className="ap-body" role="tabpanel" aria-label="Tools">
          {groups.map((g) => (
            <section key={g.title} className="ap-group" aria-label={g.title}>
              <h3 className="ap-gh">{g.title}</h3>
              {g.items.map((it) => (
                <div key={it.id} className={it.on ? 'tool on' : 'tool'} style={{ flexWrap: 'wrap' }}>
                  <div className="tool-l">
                    <span className="tool-i hd" aria-hidden="true" style={{ fontWeight: 800, fontSize: '13px' }}>{it.g}</span>
                    <div className="stack"><span className="tool-n" id={it.id}>{it.name}</span><span className="tool-s">{it.sub}</span></div>
                  </div>
                  {it.kind === 'toggle' && <button className={it.on ? 'sw on' : 'sw'} role="switch" aria-checked={it.on} aria-labelledby={it.id} onClick={it.toggle}></button>}
                  {it.kind === 'steps' && (
                    <div className="steps" role="radiogroup" aria-labelledby={it.id}>
                      {it.opts!.map((o) => <button key={o.label} className={o.on ? 'on' : ''} role="radio" aria-checked={o.on} onClick={o.pick}>{o.label}</button>)}
                    </div>
                  )}
                  {it.kind === 'seg' && (
                    <div className="ap-seg" role="radiogroup" aria-labelledby={it.id}>
                      {it.opts!.map((o) => <button key={o.label} className={o.on ? 'on' : ''} role="radio" aria-checked={o.on} onClick={o.pick}>{o.label}</button>)}
                    </div>
                  )}
                </div>
              ))}
              {g.isRead && (
                <div className="ra">
                  <div className="row between g12">
                    <div className="stack"><span className="tool-n">Read aloud</span><span className="tool-s">Uses your browser’s built-in voice</span></div>
                    <span className="bdg" style={readBadgeStyle}>{readState}</span>
                  </div>
                  <button className="btn btn-block" style={{ background: '#5BC0E3', color: '#0E1F22' }} onClick={play} disabled={!supported}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M19 5a10 10 0 0 1 0 14"></path></svg>Read this page</button>
                  <div className="row between g12">
                    <span className="tool-n" id="ra-click">Click any text to hear it</span>
                    <button className={s.read ? 'sw on' : 'sw'} role="switch" aria-checked={s.read} aria-labelledby="ra-click" onClick={() => set('read', !s.read)} style={{ borderColor: '#F5F1E6' }}></button>
                  </div>
                  <div className="row g8" role="group" aria-label="Playback">
                    <button className="ra-ctl pri" aria-label={playing ? 'Pause' : 'Play'} onClick={playPause} disabled={!supported}>
                      {playing && <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>}
                      {!playing && <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"></path></svg>}
                    </button>
                    <button className="ra-ctl" aria-label="Stop" onClick={stopReading}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"></rect></svg></button>
                  </div>
                  <div className="stack g8">
                    <span className="tool-s" id="ra-sp">Speed</span>
                    <div className="ap-seg" role="radiogroup" aria-labelledby="ra-sp" style={{ alignSelf: 'flex-start' }}>
                      {SPEEDS.map((v) => (
                        <button key={v} className={speed === v ? 'on' : ''} role="radio" aria-checked={speed === v} onClick={() => { updateSaved({ speed: v }); setReaderOptions(readOpts(v)) }}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div className="stack g8">
                    <span className="tool-s" id="ra-vo">Voice language</span>
                    <div className="ap-seg" role="radiogroup" aria-labelledby="ra-vo" style={{ alignSelf: 'flex-start' }}>
                      {([['en', 'English'], ['hi', 'हिन्दी'], ['ar', 'العربية']] as const).map(([c, l]) => (
                        <button key={c} className={voice === c ? 'on' : ''} role="radio" aria-checked={voice === c} lang={c} onClick={() => { updateSaved({ voice: c }); setReaderOptions(readOpts(speed, c)) }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <span className="tool-s">The word being read is highlighted on the page, and a small player stays on screen while it reads.</span>
                </div>
              )}
              {g.isNav && (
                <div className="tool" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                  <button className="row between g12" style={{ border: 0, background: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'start', minHeight: '44px' }} aria-expanded={structOpen} onClick={() => setStructOpen(!structOpen)}>
                    <span className="tool-l"><span className="tool-i hd" aria-hidden="true" style={{ fontWeight: 800, fontSize: '13px' }}>H</span><span className="stack"><span className="tool-n">Page structure</span><span className="tool-s">Jump straight to a heading or link</span></span></span>{' '}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  {structOpen && (
                    <nav aria-label="Page structure" className="stack g4" style={{ padding: '4px 0 4px' }}>
                      <div className="ap-seg" style={{ alignSelf: 'flex-start', marginBottom: '6px' }}>
                        <button className={structMode === 'heads' ? 'on' : ''} aria-pressed={structMode === 'heads'} onClick={() => setStructMode('heads')}>Headings ({outline.heads.length})</button>
                        <button className={structMode === 'links' ? 'on' : ''} aria-pressed={structMode === 'links'} onClick={() => setStructMode('links')}>Links ({outline.links.length})</button>
                      </div>
                      {outlineList.map((o, i) => (
                        <a
                          key={i}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onClose()
                            o.el.scrollIntoView({ block: 'center' })
                            if (o.tag === 'A') o.el.focus()
                            else {
                              o.el.setAttribute('tabindex', '-1')
                              o.el.focus()
                            }
                          }}
                          style={{ display: 'flex', gap: '8px', alignItems: 'center', minHeight: '40px', paddingInlineStart: o.lvl * 16 + 'px', fontSize: '14px', lineHeight: '20px', color: '#1C6E8A' }}
                        ><span className="bdg b-reg" style={{ height: '22px', fontSize: '12px' }}>{o.tag}</span>{o.text}</a>
                      ))}
                    </nav>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* PROFILES */}
      {tab === 'profiles' && (
        <div className="ap-body" role="tabpanel" aria-label="Profiles">
          <p className="tool-s" style={{ padding: '12px 4px 4px', fontSize: '14px', lineHeight: '20px' }}>One click turns on a set of tools. You can still change any tool afterwards.</p>
          {Object.keys(PROFILES).map((id) => {
            const P = PROFILES[id]!
            const on = profile === id
            const keys = Object.keys(P.set) as (keyof Settings)[]
            return (
              <div key={id} className={on ? 'pf on' : 'pf'}>
                <div className="pf-top">
                  <div className="stack g4"><span className="pf-n">{P.name}</span><span className="tool-s">{P.desc}</span></div>
                  <button className={on ? 'sw on' : 'sw'} role="switch" aria-checked={on} aria-label={P.name + ' profile'} onClick={() => updateSaved({ profile: on ? 'none' : id, ov: {} })}></button>
                </div>
                {on && (
                  <div className="stack g8">
                    <span className="tool-s strong" style={{ color: '#0B6B3A' }}>Switched on:</span>
                    <div className="pf-chips">
                      {keys.map((k) => (
                        <span key={k} className="pf-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>{NAMES[k] + (['size', 'lineH', 'letterS', 'wordS'].includes(k) ? ' (step 2)' : '')}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!on && <span className="tool-s">{'Turns on: ' + keys.map((k) => NAMES[k].toLowerCase()).join(', ')}</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* TRANSLATE */}
      {tab === 'translate' && (
        <div className="ap-body" role="tabpanel" aria-label="Translate">
          <p className="tool-s" style={{ padding: '12px 4px 4px', fontSize: '14px', lineHeight: '20px' }}>Choose the language for this website. Arabic switches the layout to right-to-left.</p>
          <div role="radiogroup" aria-label="Website language" className="stack">
            {([
              ['en', 'English', 'English', undefined],
              ['hi', 'हिन्दी', 'Hindi · translation coming soon', { fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '17px' }],
              ['ar', 'العربية', 'Arabic · right-to-left', { fontFamily: "'Noto Sans Arabic', sans-serif", fontSize: '18px' }],
            ] as const).map(([code, native, en, font]) => {
              const on = lang === code
              return (
                <button
                  key={code}
                  className={on ? 'lang-row on' : 'lang-row'}
                  role="radio"
                  aria-checked={on}
                  aria-disabled={code === 'hi' || undefined}
                  lang={code}
                  onClick={() => {
                    if (code === 'hi' || on) return
                    setLang(code)
                    onClose()
                    router.push(code === 'ar' ? '/ar' : '/')
                  }}
                >
                  <span className="stack"><span className="tool-n" style={font}>{native}</span><span className="tool-s" lang="en">{en}</span></span>{' '}
                  {on && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>}
                </button>
              )
            })}
          </div>
          <h3 className="ap-gh" style={{ paddingTop: '12px' }}>Other languages</h3>
          <p className="tool-s" style={{ padding: '0 4px 8px' }}>Machine translated by your browser. Wording may not be exact.</p>
          <div className="pf-chips">
            {OTHER_LANGS.map(([code, label]) => (
              <button
                key={code}
                className="chp"
                lang={code}
                style={{ minHeight: '44px' }}
                onClick={() => window.open(`https://translate.google.com/translate?sl=en&tl=${code}&u=${encodeURIComponent(location.href)}`, '_blank', 'noopener')}
              >{label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="ap-foot">
        <button className="btn btn-s btn-block" onClick={reset}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>Reset all settings</button>
        <p className="tool-s" style={{ fontSize: '14px', lineHeight: '20px', margin: '0' }}>Your settings are remembered on this device.</p>
        <p className="tool-s" style={{ margin: '0' }}><kbd style={kbd}>Esc</kbd>{' '}closes ·{' '}<kbd style={kbd}>Alt</kbd>{' '}+{' '}<kbd style={kbd}>A</kbd>{' '}opens · Tab moves through every control</p>
      </div>
    </div>
  )
}
