import Link from 'next/link'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-editor.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { LibraryEditor } from '@/components/admin/library/LibraryEditor'
import { requireAdmin } from '@/lib/admin/auth'

export const metadata = { title: 'New library resource' }

export default async function NewLibraryPage() {
  const admin = await requireAdmin('/admin/library/new')
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/library">Library</Link><span aria-hidden="true">/</span><span aria-current="page">New resource</span></nav><h1 className="h2" style={{ margin: 0 }}>New resource</h1></div>}
      />
      <main className="amain">
        <LibraryEditor id={null} initial={null} currentFile={null} />
      </main>
    </>
  )
}
