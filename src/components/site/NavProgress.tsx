'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef, useState } from 'react'

// A thin bar at the top of the window from the moment a link is clicked until the next page shows.
function Bar() {
  const pathname = usePathname()
  const search = useSearchParams()
  const [p, setP] = useState(0)
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }

  useEffect(() => {
    const start = () => {
      stop()
      setOn(true)
      setP(0.08)
      // Creep towards 90% so the bar keeps moving on slow connections.
      timer.current = setInterval(() => setP((v) => (v < 0.9 ? v + (0.9 - v) * 0.12 : v)), 200)
    }
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return
      if (url.pathname.startsWith('/api/') || /\/file$/.test(url.pathname)) return
      start()
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', start)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', start)
      stop()
    }
  }, [])

  // The new page is here: finish the bar and fade it out.
  useEffect(() => {
    stop()
    setP((v) => (v > 0 ? 1 : 0))
    const t = setTimeout(() => {
      setOn(false)
      setP(0)
    }, 320)
    return () => clearTimeout(t)
  }, [pathname, search])

  return <div className="nav-prog" aria-hidden="true" style={{ transform: `scaleX(${p})`, opacity: on ? 1 : 0 }} />
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  )
}
