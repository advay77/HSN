'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { fontStack, pageIdFromPath, type SiteDesign } from '@/lib/site/copy-defaults'

export function SiteDesignStyle({ design }: { design: SiteDesign }) {
  const path = usePathname() || '/'
  const [live, setLive] = useState<SiteDesign | null>(null)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'hsn-design' && event.data.design) setLive(event.data.design as SiteDesign)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])
  const chosen = live || design
  const body = chosen.pages[pageIdFromPath(path)] || chosen.body
  const gap = Math.min(140, Math.max(56, Number(chosen.gap) || 96))
  const css = `.pg{--sec-pad:${gap}px;--sec-pad-sm:${Math.round(gap * 0.58)}px;font-family:${fontStack(body)};--hf:${fontStack(chosen.heading)}}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
