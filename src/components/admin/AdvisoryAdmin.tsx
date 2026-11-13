'use client'

import { useRouter } from 'next/navigation'
import React, { useRef, useState, useTransition } from 'react'

import { deleteAdvisorAction, moveAdvisorAction, saveAdvisorAction } from '@/app/(frontend)/admin/advisory/actions'
import { uploadImageAction } from '@/app/(frontend)/admin/courses/actions'
import { toUploadable } from '@/lib/uploads/client'

export type AdvisorRow = {
  id: number
  name: string
  role: string
  badge: string
  bio: string
  photoUrl: string | null
  photoId: number | null
  hasPhotoPath: boolean
  published: boolean
}

type Form = { id: number | null; name: string; role: string; badge: string; bio: string; photoUrl: string | null; photoId: number | null; keepPhotoPath: boolean; published: boolean }

const blank = (): Form => ({ id: null, name: '', role: '', badge: 'Advisor', bio: '', photoUrl: null, photoId: null, keepPhotoPath: false, published: true })
const fromRow = (r: AdvisorRow): Form => ({ id: r.id, name: r.name, role: r.role, badge: r.badge, bio: r.bio, photoUrl: r.photoUrl, photoId: r.photoId, keepPhotoPath: r.hasPhotoPath, published: r.published })

export function AdvisoryAdmin({ rows }: { rows: AdvisorRow[] }) {
  const router = useRouter()
  const [f, setF] = useState<Form | null>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [pending, start] = useTransition()
  const photoInput = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<Form>) => setF((x) => (x ? { ...x, ...patch } : x))

  const choosePhoto = async (file: File | undefined) => {
    if (!file || !f) return
    setError('')
    setBusy('Uploading the photo…')
    const fd = new FormData()
    try {
      fd.set('file', await toUploadable(file, 'admin'))
    } catch (err) {
      setBusy('')
      setError(err instanceof Error ? err.message : 'The photo could not be uploaded.')
      return
    }
    fd.set('alt', f.name || 'Advisor photo')
    const r = await uploadImageAction(fd)
    setBusy('')
    if (!r.ok) return setError(r.error)
    set({ photoId: r.image.id, photoUrl: r.image.url, keepPhotoPath: false })
  }

  const save = () => {
    if (!f) return
    setError('')
    start(async () => {
      const r = await saveAdvisorAction({ id: f.id, name: f.name, role: f.role, badge: f.badge, bio: f.bio, photoId: f.photoId, keepPhotoPath: f.keepPhotoPath, published: f.published })
      if (!r.ok) return setError(r.error)
      setNote(f.published ? 'Saved. The change is live on the Advisory Board page.' : 'Saved as hidden. It is not shown on the website.')
      setF(null)
      router.refresh()
    })
  }
  const remove = (r: AdvisorRow) => {
    if (!window.confirm(`Delete ${r.name} from the Advisory Board?\n\nThis removes the profile from the website. It can't be undone.`)) return
    start(async () => {
      await deleteAdvisorAction(r.id)
      setNote(`${r.name} was deleted.`)
      if (f?.id === r.id) setF(null)
      router.refresh()
    })
  }
  const move = (id: number, dir: -1 | 1) => start(async () => { await moveAdvisorAction(id, dir); router.refresh() })

  return (
    <div className="stack g24">
      {note && <div className="note note-ok" role="status"><span>{note}</span></div>}

      <section className="card" style={{ overflowX: 'auto' }} aria-labelledby="adv-list">
        <h2 className="sr" id="adv-list">Advisors</h2>
        {rows.length === 0 && <div className="pad"><span className="muted">No advisors yet. Click Add advisor to add the first one.</span></div>}
        {rows.map((r, i) => (
          <div key={r.id} className="row g16" style={{ padding: '14px 20px', borderTop: i ? '1px solid #EDE7D8' : undefined, alignItems: 'center', flexWrap: 'wrap' }}>
            {r.photoUrl ? <img src={r.photoUrl} alt="" style={{ width: '56px', height: '64px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '10px', flex: 'none' }} /> : <span aria-hidden="true" style={{ width: '56px', height: '64px', borderRadius: '10px', background: '#E7EEF0', flex: 'none' }} />}
            <span className="stack grow" style={{ minWidth: '200px' }}>
              <strong>{i + 1}. {r.name}</strong>
              <span className="small muted">{r.role || 'No role yet'}</span>
            </span>
            <span className={r.published ? 'bdg b-ok' : 'bdg b-reg'}>{r.published ? 'On website' : 'Hidden'}</span>
            <span className="row g8 nowrap">
              <button className="cb-mini" aria-label={`Move ${r.name} up`} onClick={() => move(r.id, -1)} disabled={pending || i === 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 15 6-6 6 6"></path></svg></button>
              <button className="cb-mini" aria-label={`Move ${r.name} down`} onClick={() => move(r.id, 1)} disabled={pending || i === rows.length - 1}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
              <button className="btn btn-g btn-sm" onClick={() => { setNote(''); setError(''); setF(fromRow(r)) }}>Edit</button>
              <button className="btn btn-dl btn-sm" onClick={() => remove(r)} disabled={pending}>Delete</button>
            </span>
          </div>
        ))}
      </section>

      {!f && <button className="btn btn-p self-start" onClick={() => { setNote(''); setError(''); setF(blank()) }}>+ Add advisor</button>}

      {f && (
        <section className="card pad-l stack g20" aria-labelledby="adv-ed">
          <h2 className="h3" id="adv-ed" style={{ margin: 0 }}>{f.id ? `Edit ${f.name || 'advisor'}` : 'New advisor'}</h2>
          <div className="row g24" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="stack g8" style={{ flex: 'none' }}>
              <span className="lbl">Photo</span>
              {f.photoUrl ? <img src={f.photoUrl} alt="" style={{ width: '160px', height: '190px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '14px' }} /> : <span aria-hidden="true" style={{ width: '160px', height: '190px', borderRadius: '14px', background: '#E7EEF0', display: 'block' }} />}
              <span className="row g8">
                <button type="button" className="btn btn-s btn-sm" onClick={() => photoInput.current?.click()} disabled={!!busy}>{f.photoUrl ? 'Replace' : 'Upload photo'}</button>
                {f.photoUrl && <button type="button" className="btn btn-t btn-sm" onClick={() => set({ photoId: null, photoUrl: null, keepPhotoPath: false })}>Remove</button>}
              </span>
              <input ref={photoInput} type="file" accept="image/*" className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { choosePhoto(e.target.files?.[0]); e.target.value = '' }} />
              <span className="hint" style={{ maxWidth: '200px' }}>A portrait photo (JPG or PNG) works best.</span>
            </div>
            <div className="stack g16 grow" style={{ minWidth: '280px' }}>
              <div className="fld"><label className="lbl" htmlFor="ad-n">Name <span className="req">*</span></label><input className="inp" id="ad-n" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Dr. Jane Smith" /></div>
              <div className="fld"><label className="lbl" htmlFor="ad-r">Role / title</label><input className="inp" id="ad-r" value={f.role} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. Director of Sustainability, City Hospital" /><span className="hint">One line shown under the name.</span></div>
              <div className="fld"><label className="lbl" htmlFor="ad-b">Label</label><input className="inp" id="ad-b" value={f.badge} onChange={(e) => set({ badge: e.target.value })} style={{ maxWidth: '240px' }} /><span className="hint">The small tag above the name, e.g. Advisor or Chair.</span></div>
              <div className="fld"><label className="lbl" htmlFor="ad-p">Profile</label><textarea className="inp" id="ad-p" value={f.bio} onChange={(e) => set({ bio: e.target.value })} style={{ minHeight: '260px' }} /><span className="hint">Leave a blank line between paragraphs. The first paragraph is shown; the rest opens with &quot;Read more&quot;.</span></div>
              <label className="chk"><input type="checkbox" checked={f.published} onChange={(e) => set({ published: e.target.checked })} /><span>Show on the website</span></label>
            </div>
          </div>
          {busy && <span className="small muted" role="status">{busy}</span>}
          {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
          <div className="row g12">
            <button className="btn btn-p" onClick={save} disabled={pending || !!busy}>{pending ? 'Saving…' : 'Save advisor'}</button>
            <button className="btn btn-t" onClick={() => setF(null)} disabled={pending}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  )
}
