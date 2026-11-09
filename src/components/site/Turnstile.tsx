'use client'

import React, { useEffect, useRef } from 'react'

// Cloudflare Turnstile widget (see src/lib/turnstile.ts). Always visible, so visitors see the forms are
// protected; most people pass automatically and only see a tick. Renders nothing when
// NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set.
// Inside a <form> it also adds the hidden "cf-turnstile-response" field. Change `resetKey` after each
// submit: a token works only once.

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loading = null
      reject(new Error('Turnstile failed to load'))
    }
    document.head.appendChild(s)
  })
  return loading
}

export const turnstileOn = Boolean(SITE_KEY)

export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const id = useRef<string | null>(null)
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!SITE_KEY || !box.current) return
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        id.current = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          appearance: 'always',
          size: 'flexible',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        })
      })
      .catch(() => cb.current(''))
    return () => {
      cancelled = true
      if (id.current && window.turnstile) window.turnstile.remove(id.current)
      id.current = null
    }
  }, [])

  useEffect(() => {
    if (resetKey && id.current && window.turnstile) {
      cb.current('')
      window.turnstile.reset(id.current)
    }
  }, [resetKey])

  if (!SITE_KEY) return null
  return <div ref={box} className="turnstile" />
}
