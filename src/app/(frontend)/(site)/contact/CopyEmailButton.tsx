'use client'

import React, { useState } from 'react'

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // Older browsers: select-and-copy fallback.
      const t = document.createElement('textarea')
      t.value = email
      document.body.appendChild(t)
      t.select()
      try {
        document.execCommand('copy')
      } catch {}
      t.remove()
    }
    setCopied(true)
  }
  return (
    <button className="btn btn-s" onClick={copy} aria-live="polite">
      {copied ? 'Email copied' : 'Copy email'}
    </button>
  )
}
