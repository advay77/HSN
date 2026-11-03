'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Tells /api/track when a page is opened, how long it stayed open (only while the tab is visible), which page
// the person came from, and which links and buttons they click (their label, never anything typed).
// The page being shown, the page before it, and the outside site the visit came from. Kept outside React so a
// page mounted twice (React dev mode) keeps the same values.
let currentPath: string | null = null
let currentFrom: string | null = null
let currentReferrer = ''

// The outside site a visit started from (e.g. "google.com"), only on the first page; empty = direct.
function externalReferrer(): string {
  if (currentPath) return ''
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
    return host && host !== location.hostname.replace(/^www\./, '') ? host : ''
  } catch {
    return ''
  }
}

function beacon(data: Record<string, unknown>) {
  const body = JSON.stringify(data)
  if (navigator.sendBeacon) navigator.sendBeacon('/api/track', body)
  else fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
}

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (pathname !== currentPath) {
      currentReferrer = externalReferrer()
      currentFrom = currentPath
      currentPath = pathname
    }
    const from = currentFrom
    const referrer = currentReferrer
    const send = (phase: 'enter' | 'leave', seconds = 0) => {
      const data = { path: pathname, phase, seconds, from, referrer }
      if (phase === 'leave') beacon(data)
      else fetch('/api/track', { method: 'POST', body: JSON.stringify(data), keepalive: true }).catch(() => {})
    }
    let visibleMs = 0
    let since = document.visibilityState === 'visible' ? Date.now() : 0
    const onVis = () => {
      if (document.visibilityState === 'hidden' && since) {
        visibleMs += Date.now() - since
        since = 0
      } else if (document.visibilityState === 'visible' && !since) {
        since = Date.now()
        send('enter')
      }
    }
    const leave = () => {
      if (since) visibleMs += Date.now() - since
      since = 0
      send('leave', visibleMs / 1000)
      visibleMs = 0
    }
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('a, button, [role="button"]') as HTMLElement | null
      if (!el || el.closest('[data-no-track]')) return
      const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim()
      if (!label) return
      const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') || '' : ''
      beacon({ path: pathname, phase: 'click', label, target: href.startsWith('mailto:') ? 'email link' : href, kind: el instanceof HTMLAnchorElement ? 'link' : 'button' })
    }
    send('enter')
    // Keep "online now" fresh on long visits.
    const ping = window.setInterval(() => document.visibilityState === 'visible' && send('enter'), 2 * 60 * 1000)
    document.addEventListener('visibilitychange', onVis)
    document.addEventListener('click', onClick, true)
    window.addEventListener('pagehide', leave)
    return () => {
      leave()
      window.clearInterval(ping)
      document.removeEventListener('visibilitychange', onVis)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('pagehide', leave)
    }
  }, [pathname])

  return null
}
