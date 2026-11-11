'use client'

import React, { useLayoutEffect, useRef } from 'react'

// Keeps a box at least as tall as another box on the page (found by `source`, a CSS selector), at every
// screen width. Used on About Us so the "Our Team" box matches the "About Us" box (HSN request).
export function MatchHeight({ source, className, children }: { source: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const src = document.querySelector<HTMLElement>(source)
    if (!el || !src) return
    const fit = () => {
      el.style.minHeight = `${src.getBoundingClientRect().height}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(src)
    return () => ro.disconnect()
  }, [source])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
