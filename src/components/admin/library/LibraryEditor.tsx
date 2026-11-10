'use client'

// Library resource editor in the AdminCourses.dc.html editor language (cb-fs fieldsets, .seg pickers, .sw switch).
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { saveLibraryResource, type LibraryForm } from '@/app/(frontend)/admin/library/actions'
import { ErrorText, FilePicker, type CurrentFile } from '@/components/admin/editor/EditorParts'
import { toUploadable } from '@/lib/uploads/client'

const TYPES = ['Guide', 'Toolkit', 'Report', 'Template'] as const

const emptyResource = (): LibraryForm => ({
  title: '',
  type: '',
  access: 'free',
  description: '',
  format: '',
  size: '',
  fileId: null,
  externalUrl: '',
  published: false,
})

const formatOf = (f: File) => {
  const ext = f.name.split('.').pop()?.toLowerCase() || ''
  return ({ pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', csv: 'Excel', ppt: 'PowerPoint', pptx: 'PowerPoint', zip: 'ZIP' } as Record<string, string>)[ext] || ext.toUpperCase()
}

export function LibraryEditor({ id, initial, currentFile, saved }: { id: number | null; initial: LibraryForm | null; currentFile: CurrentFile; saved?: boolean }) {
  const router = useRouter()
  const [f, setF] = useState<LibraryForm>(() => initial ?? emptyResource())
  const [file, setFile] = useState<File | null>(null)
  const [cur, setCur] = useState<CurrentFile>(currentFile)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedText, setSavedText] = useState(saved ? 'Saved.' : '')
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()

  const set = <K extends keyof LibraryForm>(k: K, v: LibraryForm[K]) => {
    setF((x) => ({ ...x, [k]: v }))
    setDirty(true)
    setSavedText('')
  }
  const val = (k: 'title' | 'description' | 'format' | 'size' | 'externalUrl') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value)

  const save = () =>
    start(async () => {
      const fd = new FormData()
      fd.set('data', JSON.stringify({ ...f, fileId: cur ? f.fileId : null }))
      try {
        if (file) fd.set('file', await toUploadable(file, 'admin'))
      } catch (err) {
        setErrors({ file: err instanceof Error ? err.message : 'The file could not be uploaded.' })
        return
      }
      const r = await saveLibraryResource(id, fd)
      if (!r.ok) {
        setErrors(r.errors)
        return
      }
      setErrors({})
      setDirty(false)
      if (!id) {
        router.replace(`/admin/library/${r.id}?saved=1`)
        return
      }
      setFile(null)
      setSavedText(f.published ? 'Saved and live on the Library page.' : 'Saved as a draft.')
      router.refresh()
    })

  return (
    <>
      {Object.keys(errors).length > 0 && <div className="note note-err" role="alert"><span><strong>Not saved.</strong>{' '}{errors.form || 'Please fix the highlighted fields.'}</span></div>}
      <div className="cb-grid">
        <div className="stack g24">
          <fieldset className="cb-fs">
            <legend>Resource card</legend>
            <div className="fld"><label className="lbl" htmlFor="lr-t">Title <span className="req">*</span></label><input className={errors.title ? 'inp err' : 'inp'} id="lr-t" value={f.title} onChange={val('title')} /><ErrorText>{errors.title}</ErrorText></div>
            <div className="fld"><span className="lbl" id="lr-ty">Type <span className="req">*</span></span>
              <div className="seg self-start" role="group" aria-labelledby="lr-ty" style={{ flexWrap: 'wrap' }}>{TYPES.map((t) => <button key={t} type="button" className={f.type === t ? 'on' : ''} aria-pressed={f.type === t} onClick={() => set('type', t)}>{t}</button>)}</div>
              <ErrorText>{errors.type}</ErrorText>
            </div>
            <div className="fld"><label className="lbl" htmlFor="lr-d">Description <span className="opt-t">(optional)</span></label><textarea className={errors.description ? 'inp err' : 'inp'} id="lr-d" value={f.description} onChange={val('description')} style={{ minHeight: '110px' }}></textarea><span className="hint">One or two sentences on the card.</span><ErrorText>{errors.description}</ErrorText></div>
            <div className="grid c2" style={{ gap: '20px', display: 'none' }}>
              {/* Format and length are no longer shown on the Library card (HSN request); kept hidden so old values survive. */}
              <div className="fld"><label className="lbl" htmlFor="lr-f">Format <span className="opt-t">(optional)</span></label><input className="inp" id="lr-f" value={f.format} placeholder="e.g. PDF + Excel" onChange={val('format')} /></div>
              <div className="fld"><label className="lbl" htmlFor="lr-s">Length <span className="opt-t">(optional)</span></label><input className="inp" id="lr-s" value={f.size} placeholder="e.g. 24 pages, 6 files" onChange={val('size')} /></div>
            </div>
          </fieldset>
        </div>
        <div className="stack g24">
          <fieldset className="cb-fs">
            <legend>File or link</legend>
            <FilePicker
              label="File"
              hint="PDF, Word, Excel, PowerPoint or ZIP, up to 25 MB."
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.zip"
              current={cur}
              chosen={file}
              onChoose={(x) => {
                setFile(x)
                setDirty(true)
                if (x && !f.format) set('format', formatOf(x))
              }}
              onRemove={() => { setFile(null); setCur(null); setDirty(true) }}
            />
            <div className="fld"><label className="lbl" htmlFor="lr-u">Or a link <span className="opt-t">(optional)</span></label><input className={errors.externalUrl ? 'inp err' : 'inp'} id="lr-u" type="url" value={f.externalUrl} placeholder="https://" onChange={val('externalUrl')} /><span className="hint">Used when there is no file.</span><ErrorText>{errors.externalUrl}</ErrorText></div>
            <ErrorText>{errors.file}</ErrorText>
          </fieldset>
          <fieldset className="cb-fs">
            <legend>Who can open it</legend>
            <div className="seg self-start" role="group" aria-label="Access">
              <button type="button" className={f.access === 'free' ? 'on' : ''} aria-pressed={f.access === 'free'} onClick={() => set('access', 'free')}>Everyone (free)</button>
              <button type="button" className={f.access === 'members' ? 'on' : ''} aria-pressed={f.access === 'members'} onClick={() => set('access', 'members')}>Members only</button>
            </div>
            <span className="hint">Members-only resources ask visitors to log in, and only active members can download them.</span>
            <div className="row between g12" style={{ padding: '14px 16px', borderRadius: '12px', background: '#F5F1E6' }}>
              <span className="stack"><span className="strong" id="lr-pub">Published</span><span className="small muted">{f.published ? 'Shown on the Library page' : 'Hidden until you publish it'}</span></span>
              <button type="button" className={f.published ? 'sw on' : 'sw'} role="switch" aria-checked={f.published} aria-labelledby="lr-pub" onClick={() => set('published', !f.published)}></button>
            </div>
          </fieldset>
        </div>
      </div>
      <div className="row g12 mstack" style={{ paddingTop: '8px', borderTop: '1px solid #D9D2C1' }}>
        <button type="button" className="btn btn-p" disabled={pending} onClick={save}>{pending ? 'Saving…' : id ? 'Save resource' : 'Create resource'}</button>
        <Link className="btn btn-t" href="/admin/library">Back to library</Link>
        <span className="small muted" role="status">{dirty ? 'Unsaved changes' : ''}</span>
      </div>
      {savedText && !dirty && <div className="note note-ok" role="status"><span><strong>{savedText}</strong></span></div>}
    </>
  )
}
