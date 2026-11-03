'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { deleteLibraryResource, setLibraryPublished } from '@/app/(frontend)/admin/library/actions'
import { chevron } from '@/components/admin/editor/EditorParts'

export type LibraryRow = {
  id: number
  title: string
  description: string
  type: string
  access: string
  source: { label: string; url: string } | null
  details: string
  published: boolean
  when: string
}

const TYPES = ['Guide', 'Toolkit', 'Report', 'Template']

export function LibraryTable({ rows }: { rows: LibraryRow[] }) {
  const router = useRouter()
  const [type, setType] = useState('all')
  const [askDelete, setAskDelete] = useState<number | null>(null)
  const [error, setError] = useState<Record<number, string>>({})
  const [pending, start] = useTransition()
  const shown = rows.filter((r) => type === 'all' || r.type === type)

  const publish = (id: number, v: boolean) =>
    start(async () => {
      const r = await setLibraryPublished(id, v)
      setError((e) => ({ ...e, [id]: r.ok ? '' : r.error || 'Could not change it.' }))
      router.refresh()
    })
  const remove = (id: number) =>
    start(async () => {
      await deleteLibraryResource(id)
      setAskDelete(null)
      router.refresh()
    })

  if (rows.length === 0) {
    return (
      <div className="card empty">
        <span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"></path><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"></path></svg></span>
        <h2 className="h4" style={{ margin: 0 }}>No resources yet</h2>
        <p className="muted" style={{ margin: 0, maxWidth: '460px' }}>Add HSN’s guides, toolkits, reports and templates. Published ones appear on the Library page.</p>
        <Link className="btn btn-p" href="/admin/library/new">Add resource</Link>
      </div>
    )
  }

  return (
    <>
      <div className="row g12 between">
        <div className="fld"><label className="small strong muted" htmlFor="lt">Type</label><span className="sel"><select className="inp" id="lt" style={{ minHeight: '44px', width: '220px' }} value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{TYPES.map((t) => <option key={t} value={t}>{t}s</option>)}</select>{chevron}</span></div>
        <span className="strong" role="status">{`Showing ${shown.length} of ${rows.length}`}</span>
      </div>
      <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
        {shown.length > 0 ? (
          <table className="atbl m" style={{ minWidth: '960px' }}>
            <caption className="sr">Library resources</caption>
            <thead><tr><th scope="col">Resource</th><th scope="col">Type</th><th scope="col">Access</th><th scope="col">File or link</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col"><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><span className="stack"><strong>{r.title}</strong><span className="small muted">{r.details || r.description.slice(0, 90)}</span>{error[r.id] && <span className="emsg">{error[r.id]}</span>}</span></td>
                  <td data-l="Type" className="small">{r.type}</td>
                  <td data-l="Access"><span className={r.access === 'Members' ? 'bdg b-info' : 'bdg b-ok'}>{r.access}</span></td>
                  <td data-l="File" className="small">{r.source ? <a href={r.source.url} target="_blank" rel="noopener" style={{ overflowWrap: 'anywhere' }}>{r.source.label}</a> : <span className="muted">None yet</span>}</td>
                  <td data-l="Status"><span className={r.published ? 'bdg b-ok' : 'bdg b-reg'}>{r.published ? 'Published' : 'Draft'}</span></td>
                  <td data-l="Updated" className="small">{r.when}</td>
                  <td>
                    {askDelete === r.id ? (
                      <div className="acts"><button className="btn btn-danger" disabled={pending} onClick={() => remove(r.id)}>Delete</button><button className="btn btn-g" onClick={() => setAskDelete(null)}>Cancel</button></div>
                    ) : (
                      <div className="acts">
                        <Link className="btn btn-g" href={`/admin/library/${r.id}`}>Edit</Link>
                        <button className="btn btn-g" disabled={pending} onClick={() => publish(r.id, !r.published)}>{r.published ? 'Unpublish' : 'Publish'}</button>
                        <button className="btn btn-dl" onClick={() => setAskDelete(r.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><h2 className="h4" style={{ margin: 0 }}>No {type.toLowerCase()}s yet</h2><button className="btn btn-s" onClick={() => setType('all')}>Show all types</button></div>
        )}
      </div>
    </>
  )
}
