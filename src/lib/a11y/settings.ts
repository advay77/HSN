'use client'

// Accessibility settings from the A11yPanel design: profiles, per-tool overrides, remembered on this device.
// One small store shared by the panel (in the Header) and the effects component (in the site layout).

export type Align = 'off' | 'left' | 'center' | 'justify'
export type Settings = {
  size: number
  readable: boolean
  dys: boolean
  lineH: number
  letterS: number
  wordS: number
  align: Align
  contrast: boolean
  dark: boolean
  lowsat: boolean
  grey: boolean
  highsat: boolean
  cb: boolean
  links: boolean
  heads: boolean
  guide: boolean
  mask: boolean
  hideImg: boolean
  read: boolean
  pause: boolean
  cursor: boolean
  focus: boolean
  targets: boolean
}

export const BASE: Settings = {
  size: 0, readable: false, dys: false, lineH: 0, letterS: 0, wordS: 0, align: 'off',
  contrast: false, dark: false, lowsat: false, grey: false, highsat: false, cb: false,
  links: false, heads: false, guide: false, mask: false, hideImg: false,
  read: false, pause: false, cursor: false, focus: false, targets: false,
}

export const NAMES: Record<keyof Settings, string> = {
  size: 'Bigger text', readable: 'Readable font', dys: 'Dyslexia-friendly font', lineH: 'Line spacing', letterS: 'Letter spacing', wordS: 'Word spacing', align: 'Left-aligned text',
  contrast: 'High contrast', dark: 'Dark mode', lowsat: 'Low saturation', grey: 'Greyscale', highsat: 'High saturation', cb: 'Color-blind-safe colors',
  links: 'Highlight links', heads: 'Highlight headings', guide: 'Reading guide', mask: 'Reading mask', hideImg: 'Hide images',
  read: 'Read aloud', pause: 'Pause animations', cursor: 'Big cursor', focus: 'Strong focus outline', targets: 'Larger click areas',
}

export const PROFILES: Record<string, { name: string; desc: string; set: Partial<Settings> }> = {
  visual: { name: 'Visually impaired', desc: 'Larger, clearer text and stronger contrast', set: { size: 2, readable: true, contrast: true, links: true, cursor: true, read: true } },
  dyslexia: { name: 'Dyslexia', desc: 'Easier letter shapes and more space between lines and words', set: { dys: true, lineH: 2, letterS: 2, wordS: 2, align: 'left', guide: true } },
  adhd: { name: 'ADHD', desc: 'Fewer distractions while you read', set: { mask: true, pause: true, lowsat: true } },
  seizure: { name: 'Seizure safe', desc: 'Stops movement and softens strong colors', set: { pause: true, lowsat: true } },
  colorblind: { name: 'Color blind', desc: 'Colors that stay distinct for all types of color blindness', set: { cb: true, links: true } },
  cognitive: { name: 'Cognitive', desc: 'Clear structure and support to follow the page', set: { readable: true, heads: true, links: true, guide: true, read: true } },
  mobility: { name: 'Impaired mobility', desc: 'Bigger targets and a clear keyboard path', set: { cursor: true, focus: true, targets: true } },
}

export type Saved = { profile: string; ov: Partial<Settings>; speed: string; voice: string }

const KEY = 'hsn-a11y'
const DEFAULT: Saved = { profile: 'none', ov: {}, speed: '1x', voice: 'en' }

let saved: Saved = DEFAULT
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) saved = { ...DEFAULT, ...JSON.parse(raw) }
  } catch {}
}

export function getSaved(): Saved {
  load()
  return saved
}

export const getServerSaved = (): Saved => DEFAULT

export function updateSaved(patch: Partial<Saved>) {
  load()
  saved = { ...saved, ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {}
  listeners.forEach((l) => l())
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function effective(s: Saved): Settings {
  const p = s.profile !== 'none' && PROFILES[s.profile] ? PROFILES[s.profile]!.set : {}
  return { ...BASE, ...p, ...s.ov }
}

export function activeKeys(s: Settings) {
  return (Object.keys(BASE) as (keyof Settings)[]).filter((k) =>
    typeof BASE[k] === 'boolean' ? !!s[k] : !!s[k] && s[k] !== 'off',
  )
}
