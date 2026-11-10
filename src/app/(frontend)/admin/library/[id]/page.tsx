import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-editor.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { LibraryEditor } from '@/components/admin/library/LibraryEditor'
import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import { currentFile } from '../../case-studies/editor-data'

export const metadata = { title: 'Edit library resource' }

export default async function EditLibraryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params
  const admin = await requireAdmin(`/admin/library/${id}`)
  const num = Number(id)
  if (!Number.isInteger(num)) notFound()
  const payload = await getPayloadClient()
  const r = await payload.findByID({ collection: 'library-resources', id: num, depth: 1 }).catch(() => null)
  if (!r) notFound()
  const fileId = r.file && typeof r.file === 'object' ? Number(r.file.id) : typeof r.file === 'number' ? r.file : null
  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><Link href="/admin/library">Library</Link><span aria-hidden="true">/</span><span aria-current="page">{r.title}</span></nav><span className={r.published ? 'bdg b-ok' : 'bdg b-reg'} style={{ height: '22px', alignSelf: 'flex-start' }}>{r.published ? 'Published' : 'Draft'}</span></div>}
      />
      <main className="amain">
        <LibraryEditor
          id={num}
          initial={{
            title: r.title,
            type: r.type,
            access: r.access === 'members' ? 'members' : 'free',
            description: r.description || '',
            format: r.format || '',
            size: r.size || '',
            fileId,
            externalUrl: r.externalUrl || '',
            published: !!r.published,
          }}
          currentFile={currentFile(r.file)}
          saved={(await searchParams).saved === '1'}
        />
      </main>
    </>
  )
}
