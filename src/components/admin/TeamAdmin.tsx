'use client'

import { useRouter } from 'next/navigation'
import React, { useRef, useState, useTransition } from 'react'

import { deleteTeamMemberAction, moveTeamMemberAction, saveTeamMemberAction } from '@/app/(frontend)/admin/team/actions'
import { uploadImageAction } from '@/app/(frontend)/admin/courses/actions'
import { toUploadable } from '@/lib/uploads/client'

export type TeamRow = {
  id: number
  name: string
  role: string
  bio: string
  photoUrl: string | null
  photoId: number | null
  published: boolean
}

type Form = { id: number | null; name: string; role: string; bio: string; photoUrl: string | null; photoId: number | null; published: boolean }

const blank = (): Form => ({ id: null, name: '', role: '', bio: '', photoUrl: null, photoId: null, published: true })
const fromRow = (r: TeamRow): Form => ({ id: r.id, name: r.name, role: r.role, bio: r.bio, photoUrl: r.photoUrl, photoId: r.photoId, published: r.published })

export function TeamAdmin({ rows }: { rows: TeamRow[] }) {
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
    fd.set('alt', f.name || 'Team photo')
    const r = await uploadImageAction(fd)
    setBusy('')
    if (!r.ok) return setError(r.error)
    set({ photoId: r.image.id, photoUrl: r.image.url })
  }

  const save = () => {
    if (!f) return
    setError('')
    start(async () => {
      const r = await saveTeamMemberAction({ id: f.id, name: f.name, role: f.role, bio: f.bio, photoId: f.photoId, published: f.published })
      if (!r.ok) return setError(r.error)
      setNote(f.published ? 'Saved. The change is live on the Our Team page.' : 'Saved as hidden. It is not shown on the website.')
      setF(null)
      router.refresh()
    })
  }
  const remove = (r: TeamRow) => {
    if (!window.confirm(`Delete ${r.name} from Our Team?\n\nThis removes the profile from the website. It can't be undone.`)) return
    start(async () => {
      await deleteTeamMemberAction(r.id)
      setNote(`${r.name} was deleted.`)
      if (f?.id === r.id) setF(null)
      router.refresh()
    })
  }
  const move = (id: number, dir: -1 | 1) => start(async () => { await moveTeamMemberAction(id, dir); router.refresh() })

  return (
    <div className="stack g24">
      {note && <div className="note note-ok" role="status"><span>{note}</span></div>}

      <section className="card" style={{ overflowX: 'auto' }} aria-labelledby="team-list">
        <h2 className="sr" id="team-list">Team members</h2>
        {rows.length === 0 && <div className="pad"><span className="muted">No team members yet. Click Add team member to add the first one.</span></div>}
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

      {!f && <button className="btn btn-p self-start" onClick={() => { setNote(''); setError(''); setF(blank()) }}>+ Add team member</button>}

      {f && (
        <section className="card pad-l stack g20" aria-labelledby="team-ed">
          <h2 className="h3" id="team-ed" style={{ margin: 0 }}>{f.id ? `Edit ${f.name || 'team member'}` : 'New team member'}</h2>
          <div className="row g24" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="stack g8" style={{ flex: 'none' }}>
              <span className="lbl">Photo</span>
              {f.photoUrl ? <img src={f.photoUrl} alt="" style={{ width: '160px', height: '190px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '14px' }} /> : <span aria-hidden="true" style={{ width: '160px', height: '190px', borderRadius: '14px', background: '#E7EEF0', display: 'block' }} />}
              <span className="row g8">
                <button type="button" className="btn btn-s btn-sm" onClick={() => photoInput.current?.click()} disabled={!!busy}>{f.photoUrl ? 'Replace' : 'Upload photo'}</button>
                {f.photoUrl && <button type="button" className="btn btn-t btn-sm" onClick={() => set({ photoId: null, photoUrl: null })}>Remove</button>}
              </span>
              <input ref={photoInput} type="file" accept="image/*" className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { choosePhoto(e.target.files?.[0]); e.target.value = '' }} />
              <span className="hint" style={{ maxWidth: '200px' }}>A portrait photo (JPG or PNG) works best.</span>
            </div>
            <div className="stack g16 grow" style={{ minWidth: '280px' }}>
              <div className="fld"><label className="lbl" htmlFor="tm-n">Name <span className="req">*</span></label><input className="inp" id="tm-n" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Dr. Jane Smith" /></div>
              <div className="fld"><label className="lbl" htmlFor="tm-r">Role / title</label><input className="inp" id="tm-r" value={f.role} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. Programme Lead" /><span className="hint">One line shown under the name.</span></div>
              <div className="fld"><label className="lbl" htmlFor="tm-b">Intro</label><textarea className="inp" id="tm-b" value={f.bio} onChange={(e) => set({ bio: e.target.value })} style={{ minHeight: '220px' }} /><span className="hint">Shown when a visitor opens this profile. Leave a blank line between paragraphs.</span></div>
              <label className="chk"><input type="checkbox" checked={f.published} onChange={(e) => set({ published: e.target.checked })} /><span>Show on the website</span></label>
            </div>
          </div>
          {busy && <span className="small muted" role="status">{busy}</span>}
          {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
          <div className="row g12">
            <button className="btn btn-p" onClick={save} disabled={pending || !!busy}>{pending ? 'Saving…' : 'Save team member'}</button>
            <button className="btn btn-t" onClick={() => setF(null)} disabled={pending}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  )
}
