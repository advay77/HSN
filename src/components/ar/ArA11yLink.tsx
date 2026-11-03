'use client'

import React from 'react'

import { OPEN_A11Y_EVENT } from '@/components/site/FooterA11yLink'

// Arabic footer "إمكانية الوصول" link: opens the accessibility panel like the header button.
export function ArA11yLink() {
  return (
    <a
      className="ftr-l"
      href="#accessibility"
      onClick={(e) => {
        e.preventDefault()
        window.dispatchEvent(new Event(OPEN_A11Y_EVENT))
      }}
    >
      إمكانية الوصول
    </a>
  )
}
