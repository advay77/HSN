// Admin → Page text: the short sentences on About, Services, and Case Studies.
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-courses.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SiteTextAdmin } from '@/components/admin/SiteTextAdmin'
import { requireAdmin } from '@/lib/admin/auth'
import { getSiteCopy } from '@/lib/site/copy'

export const metadata = { title: 'Page text' }
export const dynamic = 'force-dynamic'

export default async function SiteTextPage() {
  const admin = await requireAdmin('/admin/site-text')
  const copy = await getSiteCopy()
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Website</h1><span className="small muted">Edit a page, see it on the right, then save</span></div>}
      />
      <main className="amain">
        <SiteTextAdmin initial={copy} />
      </main>
    </>
  )
}
