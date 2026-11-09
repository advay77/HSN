'use client'

import React, { useLayoutEffect, useRef } from 'react'

// Lays the certificate out at its full design width and scales it down to fit, like a picture,
// so small text never gets bumped up by the browser's minimum font size on phones.
export function CertificateFit({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => el.style.setProperty('--fit', String(el.clientWidth / 1000))
    fit()
    el.classList.add('fit')
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <article ref={ref} className="cert" aria-label={label}>
      {children}
    </article>
  )
}
