import React from 'react'

import '@/app/(frontend)/styles/site.css'

import '../styles/pages/player.css'

import { A11yEffects } from '@/components/site/A11yEffects'
import { PageTracker } from '@/components/site/PageTracker'

// The lesson player has its own top bar and no site header/footer (Player.dc.html).
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pg pl-root" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#17323A', background: '#F5F1E6', minHeight: '100vh' }}>
      {children}
      <A11yEffects />
      <PageTracker />
    </div>
  )
}
