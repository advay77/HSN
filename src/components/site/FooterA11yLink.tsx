'use client'

import React from 'react'

export const OPEN_A11Y_EVENT = 'hsn:open-a11y'

// The footer "Accessibility" link opens the same panel as the header wheelchair button.
export function FooterA11yLink({ label = 'Accessibility' }: { label?: string }) {
  return (
    <a
      className="ftr-l"
      href="#accessibility"
      onClick={(e) => {
        e.preventDefault()
        window.dispatchEvent(new Event(OPEN_A11Y_EVENT))
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg>{label}
    </a>
  )
}
