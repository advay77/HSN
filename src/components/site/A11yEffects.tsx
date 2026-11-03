'use client'

// Applies the saved accessibility settings to the whole site: body classes (styles/a11y.css),
// the reading guide and mask, click-to-read, and the floating read-aloud player.
import React, { useEffect, useState, useSyncExternalStore } from 'react'

import { getReader, getServerReader, startReading, stopReading, subscribeReader, togglePause } from '@/lib/a11y/reader'
import { effective, getSaved, getServerSaved, subscribe } from '@/lib/a11y/settings'

import '@/app/(frontend)/styles/a11y.css'

const FILTERS = { lowsat: 'saturate(.5)', grey: 'grayscale(1)', highsat: 'saturate(1.6)', dark: 'invert(.92) hue-rotate(180deg)' } as const

export function A11yEffects() {
  const saved = useSyncExternalStore(subscribe, getSaved, getServerSaved)
  const reader = useSyncExternalStore(subscribeReader, getReader, getServerReader)
  const s = effective(saved)
  const [y, setY] = useState<number | null>(null)

  // Body classes and CSS variables.
  useEffect(() => {
    const b = document.body
    const classes: string[] = []
    if (s.size) classes.push('a-size-' + s.size)
    if (s.readable) classes.push('a-readable')
    if (s.dys) classes.push('a-dys')
    if (s.lineH) classes.push('a-lh-' + s.lineH)
    if (s.letterS) classes.push('a-ls-' + s.letterS)
    if (s.wordS) classes.push('a-ws-' + s.wordS)
    if (s.align !== 'off') classes.push('a-align-' + s.align)
    if (s.contrast) classes.push('a-hc')
    if (s.cb) classes.push('a-cb')
    if (s.links) classes.push('a-links')
    if (s.heads) classes.push('a-heads')
    if (s.hideImg) classes.push('a-hideimg')
    if (s.read) classes.push('a-clickread')
    if (s.pause) classes.push('a-pause')
    if (s.cursor) classes.push('a-cursor')
    if (s.focus) classes.push('a-focus')
    if (s.targets) classes.push('a-targets')
    const filter = (Object.keys(FILTERS) as (keyof typeof FILTERS)[])
      .filter((k) => s[k] && !(k === 'dark' && s.contrast))
      .map((k) => FILTERS[k])
      .join(' ')
    if (filter) classes.push('a-filter')
    if (s.dark && !s.contrast) classes.push('a-dark')
    classes.forEach((c) => b.classList.add(c))
    b.style.setProperty('--a11y-filter', filter || 'none')
    return () => {
      classes.forEach((c) => b.classList.remove(c))
      b.style.removeProperty('--a11y-filter')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(s)])

  // Reading guide / mask follow the pointer.
  useEffect(() => {
    if (!s.guide && !s.mask) {
      setY(null)
      return
    }
    const move = (e: PointerEvent) => setY(e.clientY)
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [s.guide, s.mask])

  // Click any text to hear it.
  useEffect(() => {
    if (!s.read) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t || t.closest('a, button, input, select, textarea, label, .ap, .pbar')) return
      const block = t.closest<HTMLElement>('.pg h1, .pg h2, .pg h3, .pg h4, .pg h5, .pg p, .pg li, .pg dt, .pg dd, .pg td, .pg th, .pg figcaption')
      if (block) startReading(block, { rate: parseFloat(saved.speed || '1x'), lang: saved.voice || 'en' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [s.read, saved.speed, saved.voice])

  // Stop speaking when leaving the page.
  useEffect(() => () => stopReading(), [])

  const reading = reader.status !== 'idle'
  const pct = reader.total ? Math.round(((reader.index + 1) / reader.total) * 100) : 0

  return (
    <>
      <style>{'::highlight(hsn-read){background-color:#FFD24D;color:#17323A}'}</style>
      {s.guide && y !== null && <div className="rguide" aria-hidden="true" style={{ position: 'fixed', top: y - 22, zIndex: 55 }} />}
      {s.mask && y !== null && (
        <>
          <div className="rmask" aria-hidden="true" style={{ position: 'fixed', top: 0, height: Math.max(0, y - 30), zIndex: 55 }} />
          <div className="rmask" aria-hidden="true" style={{ position: 'fixed', top: y + 30, bottom: 0, zIndex: 55 }} />
        </>
      )}
      {reading && (
        <div className="pbar" role="region" aria-label="Read aloud player" style={{ position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)', zIndex: 58, width: 'min(440px, calc(100% - 32px))' }}>
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{reader.status === 'playing' ? 'Reading' : 'Paused'}</span>
          <span className="pbar-prog" aria-hidden="true"><span style={{ width: pct + '%' }} /></span>
          <button className="ra-ctl pri" aria-label={reader.status === 'playing' ? 'Pause' : 'Play'} onClick={togglePause}>
            {reader.status === 'playing'
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"></path></svg>}
          </button>
          <button className="ra-ctl" aria-label="Stop" onClick={stopReading}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"></rect></svg></button>
        </div>
      )}
    </>
  )
}
