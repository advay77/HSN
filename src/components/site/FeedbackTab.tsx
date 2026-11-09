'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/site-feedback.css'

/** Small "Feedback" button fixed to the edge of every public page (hidden on the feedback page and login). */
export function FeedbackTab() {
  const path = usePathname() || '/'
  if (path === '/feedback' || path.startsWith('/login') || path.startsWith('/ar')) return null
  return (
    <a className="sfb-tab" href="/feedback">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      Feedback
    </a>
  )
}
