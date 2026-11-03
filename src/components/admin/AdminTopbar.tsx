'use client'

import React, { useState } from 'react'

import { A11yPanel } from '@/components/site/A11yPanel'

// The .atop bar every admin board has: page heading on the left, page actions + accessibility button +
// account avatar on the right. `rightClass` keeps each board's own wrapper ("row g12" or "row g8").
export function AdminTopbar({
  left,
  actions,
  initial,
  rightTag = 'div',
  rightClass = 'row g12',
}: {
  left: React.ReactNode
  actions?: React.ReactNode
  initial: string
  rightTag?: 'div' | 'span'
  rightClass?: string
}) {
  const [a11yOpen, setA11yOpen] = useState(false)
  const Right = rightTag
  return (
    <>
      <div className="atop">
        {left}
        <Right className={rightClass}>
          {actions}
          <button className="a11y" aria-label="Accessibility options" aria-haspopup="dialog" aria-expanded={a11yOpen} onClick={() => setA11yOpen(true)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg></button><span className="avatar" aria-label="Founder account" role="img">{initial}</span>
        </Right>
      </div>
      {a11yOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(14,31,34,.32)' }} onClick={() => setA11yOpen(false)} aria-hidden="true"></div>
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 61, width: '440px', maxWidth: '100%', overflowY: 'auto', background: '#FFFDF8' }}><A11yPanel onClose={() => setA11yOpen(false)} /></div>
        </>
      )}
    </>
  )
}
