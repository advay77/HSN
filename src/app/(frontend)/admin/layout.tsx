// Admin panel shell from the Admin*.dc.html boards: teal sidebar + page column. Founder/team only.
import React from 'react'

import '@/app/(frontend)/styles/hsn3.css'
import '@/app/(frontend)/styles/admin.css'

import { AdminNav } from '@/components/admin/AdminNav'
import { A11yEffects } from '@/components/site/A11yEffects'
import { getAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

export const metadata = { title: { default: 'Admin', template: '%s · HSN Admin' }, robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Each page calls requireAdmin(itsPath), so the login redirect comes back to the page that was asked for.
  // Without an admin session the shell renders nothing around it.
  if (!(await getAdmin())) return <>{children}</>
  const payload = await getPayloadClient()
  const pending = await payload.count({ collection: 'case-studies', where: { status: { equals: 'submitted' } } })
  return (
    <div className="pg" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#17323A', background: '#F5F1E6' }}>
      <div className="adm">
        <aside className="aside" aria-label="Admin">
          <a className="logo" href="/admin" style={{ textDecoration: 'none' }}><span className="logo-m"><img src="/images/hsn-logo.jpg" alt="" /></span><span className="logo-t"><span className="logo-1">HSN ADMIN</span><span className="logo-2">FOUNDER ONLY</span></span></a>
          <AdminNav pendingCases={pending.totalDocs} />
          <div className="anav aside-x" style={{ marginTop: 'auto', borderTop: '1px solid #2D6878', paddingTop: '12px' }}><a href="/">View website</a><a href="/admin/logout">Log out</a></div>
        </aside>
        <div className="stack" style={{ minWidth: 0 }}>{children}</div>
      </div>
      <A11yEffects />
    </div>
  )
}
