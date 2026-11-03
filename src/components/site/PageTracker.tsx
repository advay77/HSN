'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Tells /api/track when a page is opened and how long it stayed open (only time while the tab is visible).
export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const send = (phase: 'enter' | 'leave', seconds = 0) => {
      const body = JSON.stringify({ path: pathname, phase, seconds })
      if (phase === 'leave' && navigator.sendBeacon) navigator.sendBeacon('/api/track', body)
      else fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
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
    send('enter')
    // Keep "online now" fresh on long visits.
    const ping = window.setInterval(() => document.visibilityState === 'visible' && send('enter'), 2 * 60 * 1000)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', leave)
    return () => {
      leave()
      window.clearInterval(ping)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', leave)
    }
  }, [pathname])

  return null
}
