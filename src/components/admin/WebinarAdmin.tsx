'use client'

import { useRouter } from 'next/navigation'
import React, { useRef, useState, useTransition } from 'react'

import { uploadImageAction, uploadVideoAction } from '@/app/(frontend)/admin/courses/actions'
import { deleteWebinarAction, saveWebinarAction } from '@/app/(frontend)/admin/webinars/actions'
import { toUploadable } from '@/lib/uploads/client'
import { formatWebinarDate, initialsOf } from '@/lib/webinars'

type Speaker = { name: string; role: string; label: string; photoId: number | null; photoUrl: string | null }

export type WebinarRow = {
  id: number
  title: string
  date: string
  time: string
  summary: string
  youtubeUrl: string
  videoId: number | null
  videoName: string | null
  speakers: Speaker[]
  published: boolean
}

type Form = Omit<WebinarRow, 'id'> & { id: number | null }

const blankSpeaker = (): Speaker => ({ name: '', role: '', label: 'Speaker', photoId: null, photoUrl: null })
const blank = (): Form => ({ id: null, title: '', date: '', time: '', summary: '', youtubeUrl: '', videoId: null, videoName: null, speakers: [blankSpeaker()], published: true })

export function WebinarAdmin({ rows }: { rows: WebinarRow[] }) {
  const router = useRouter()
  const [f, setF] = useState<Form | null>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [pending, start] = useTransition()
  const videoInput = useRef<HTMLInputElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const photoFor = useRef<number>(-1)
  const set = (patch: Partial<Form>) => setF((x) => (x ? { ...x, ...patch } : x))
  const setSpeaker = (i: number, patch: Partial<Speaker>) => setF((x) => (x ? { ...x, speakers: x.speakers.map((s, n) => (n === i ? { ...s, ...patch } : s)) } : x))

  const upload = async (file: File, purpose: 'admin' | 'admin-video', alt: string) => {
    const fd = new FormData()
    fd.set('file', await toUploadable(file, purpose))
    fd.set('alt', alt)
    return purpose === 'admin-video' ? uploadVideoAction(fd) : uploadImageAction(fd)
  }

  const chooseVideo = async (file: File | undefined) => {
    if (!file || !f) return
    setError('')
    setBusy('Uploading the video… this can take a minute')
    try {
      const r = await upload(file, 'admin-video', f.title || file.name)
      if (!r.ok) return setError(r.error)
      if ('file' in r) set({ videoId: Number(r.file.id), videoName: r.file.name })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The video could not be uploaded.')
    } finally {
      setBusy('')
    }
  }

  const choosePhoto = async (file: File | undefined) => {
    const i = photoFor.current
    if (!file || !f || i < 0) return
    setError('')
    setBusy('Uploading the photo…')
    try {
      const r = await upload(file, 'admin', f.speakers[i]?.name || 'Speaker photo')
      if (!r.ok) return setError(r.error)
      if ('image' in r) setSpeaker(i, { photoId: Number(r.image.id), photoUrl: r.image.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The photo could not be uploaded.')
    } finally {
      setBusy('')
    }
  }

  const save = () => {
    if (!f) return
    setError('')
    start(async () => {
      const r = await saveWebinarAction({
        id: f.id, title: f.title, date: f.date, time: f.time, summary: f.summary, youtubeUrl: f.youtubeUrl, videoId: f.videoId,
        speakers: f.speakers.map((s) => ({ name: s.name, role: s.role, label: s.label, photoId: s.photoId })),
        published: f.published,
      })
      if (!r.ok) return setError(r.error)
      setNote(f.published ? 'Saved. The webinar is live on the Webinars page.' : 'Saved as hidden. It is not shown on the website.')
      setF(null)
      router.refresh()
    })
  }

  const remove = (r: WebinarRow) => {
    if (!window.confirm(`Delete the webinar "${r.title}"?\n\nThis removes it from the website. It can't be undone.`)) return
    start(async () => {
      const res = await deleteWebinarAction(r.id)
      if (!res.ok) return setError(res.error)
      setNote(`"${r.title}" was deleted.`)
      if (f?.id === r.id) setF(null)
      router.refresh()
    })
  }

  return (
    <div className="stack g24">
      {note && <div className="note note-ok" role="status"><span>{note}</span></div>}
      {!f && error && <div className="note note-err" role="alert"><span>{error}</span></div>}

      <section className="card" style={{ overflowX: 'auto' }} aria-labelledby="web-list">
        <h2 className="sr" id="web-list">Webinars</h2>
        {rows.length === 0 && <div className="pad"><span className="muted">No webinars yet. Click Add webinar to add the first one.</span></div>}
        {rows.map((r, i) => (
          <div key={r.id} className="row g16" style={{ padding: '14px 20px', borderTop: i ? '1px solid #EDE7D8' : undefined, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="stack grow" style={{ minWidth: '240px' }}>
              <strong>{r.title}</strong>
              <span className="small muted">
                {formatWebinarDate(r.date)}{r.time ? ` · ${r.time}` : ''} · {r.speakers.length} {r.speakers.length === 1 ? 'speaker' : 'speakers'} · {r.youtubeUrl ? 'YouTube video' : r.videoId ? 'Uploaded video' : 'No recording yet'}
              </span>
            </span>
            <span className={r.published ? 'bdg b-ok' : 'bdg b-reg'}>{r.published ? 'On website' : 'Hidden'}</span>
            <span className="row g8 nowrap">
              <button className="btn btn-g btn-sm" onClick={() => { setNote(''); setError(''); setF({ ...r, speakers: r.speakers.map((s) => ({ ...s })) }) }}>Edit</button>
              <button className="btn btn-dl btn-sm" onClick={() => remove(r)} disabled={pending}>Delete</button>
            </span>
          </div>
        ))}
      </section>

      {!f && <button className="btn btn-p self-start" onClick={() => { setNote(''); setError(''); setF(blank()) }}>+ Add webinar</button>}

      {f && (
        <section className="card pad-l stack g20" aria-labelledby="web-ed">
          <h2 className="h3" id="web-ed" style={{ margin: 0 }}>{f.id ? `Edit ${f.title || 'webinar'}` : 'New webinar'}</h2>

          <div className="fld"><label className="lbl" htmlFor="wb-t">Webinar title <span className="req">*</span></label><input className="inp" id="wb-t" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Embedding SusQI and Setting the Standard for Sustainable Healthcare" /></div>
          <div className="grid c2" style={{ gap: '16px' }}>
            <div className="fld"><label className="lbl" htmlFor="wb-d">Date <span className="req">*</span></label><input className="inp" id="wb-d" type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /></div>
            <div className="fld"><label className="lbl" htmlFor="wb-tm">Time</label><input className="inp" id="wb-tm" value={f.time} onChange={(e) => set({ time: e.target.value })} placeholder="e.g. 6:00–7:00 pm IST" /><span className="hint">Optional.</span></div>
          </div>
          <div className="fld"><label className="lbl" htmlFor="wb-s">About this webinar</label><textarea className="inp" id="wb-s" value={f.summary} onChange={(e) => set({ summary: e.target.value })} style={{ minHeight: '140px' }} /><span className="hint">A few sentences on what was covered. Leave a blank line between paragraphs.</span></div>

          <fieldset className="stack g12" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="lbl">Speakers</legend>
            {f.speakers.map((s, i) => (
              <div key={i} className="card pad row g16" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="stack g8" style={{ flex: 'none', alignItems: 'center' }}>
                  {s.photoUrl ? <img src={s.photoUrl} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '999px' }} /> : <span aria-hidden="true" style={{ width: '72px', height: '72px', borderRadius: '999px', background: '#E7EEF0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#134E5E' }}>{initialsOf(s.name || '?')}</span>}
                  <button type="button" className="btn btn-s btn-sm" onClick={() => { photoFor.current = i; photoInput.current?.click() }} disabled={!!busy}>{s.photoUrl ? 'Replace photo' : 'Add photo'}</button>
                  {s.photoUrl && <button type="button" className="btn btn-t btn-sm" onClick={() => setSpeaker(i, { photoId: null, photoUrl: null })}>Remove photo</button>}
                </div>
                <div className="stack g12 grow" style={{ minWidth: '240px' }}>
                  <div className="grid c2" style={{ gap: '12px' }}>
                    <div className="fld"><label className="lbl" htmlFor={`sp-n-${i}`}>Name <span className="req">*</span></label><input className="inp" id={`sp-n-${i}`} value={s.name} onChange={(e) => setSpeaker(i, { name: e.target.value })} placeholder="e.g. Dr. Maher El Masri" /></div>
                    <div className="fld"><label className="lbl" htmlFor={`sp-l-${i}`}>Part in the webinar</label><input className="inp" id={`sp-l-${i}`} value={s.label} onChange={(e) => setSpeaker(i, { label: e.target.value })} placeholder="Speaker, Moderator, Panelist" /></div>
                  </div>
                  <div className="fld"><label className="lbl" htmlFor={`sp-r-${i}`}>Role / organization</label><input className="inp" id={`sp-r-${i}`} value={s.role} onChange={(e) => setSpeaker(i, { role: e.target.value })} placeholder="e.g. Director of Quality, City Hospital" /></div>
                  <button type="button" className="btn btn-t btn-sm self-start" onClick={() => set({ speakers: f.speakers.filter((_, n) => n !== i) })}>Remove speaker</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-s btn-sm self-start" onClick={() => set({ speakers: [...f.speakers, blankSpeaker()] })}>+ Add speaker</button>
            <input ref={photoInput} type="file" accept="image/*" className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { choosePhoto(e.target.files?.[0]); e.target.value = '' }} />
          </fieldset>

          <fieldset className="stack g12" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="lbl">Recording</legend>
            <div className="fld"><label className="lbl" htmlFor="wb-y">YouTube link</label><input className="inp" id="wb-y" value={f.youtubeUrl} onChange={(e) => set({ youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" /><span className="hint">Paste the link from the video’s Share button. If both are given, the YouTube video is shown.</span></div>
            <div className="stack g8">
              <span className="lbl">Or upload a video</span>
              {f.videoId ? (
                <span className="row g8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="bdg b-ok">Video uploaded</span><span className="small">{f.videoName}</span>
                  <button type="button" className="btn btn-s btn-sm" onClick={() => videoInput.current?.click()} disabled={!!busy}>Replace</button>
                  <button type="button" className="btn btn-t btn-sm" onClick={() => set({ videoId: null, videoName: null })}>Remove</button>
                </span>
              ) : (
                <button type="button" className="btn btn-s btn-sm self-start" onClick={() => videoInput.current?.click()} disabled={!!busy}>Upload a video</button>
              )}
              <span className="hint">MP4 works best (WebM and MOV also work), up to 50 MB. For longer recordings, upload to YouTube and paste the link above.</span>
              <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov" className="sr" tabIndex={-1} aria-hidden="true" onChange={(e) => { chooseVideo(e.target.files?.[0]); e.target.value = '' }} />
            </div>
          </fieldset>

          <label className="chk"><input type="checkbox" checked={f.published} onChange={(e) => set({ published: e.target.checked })} /><span>Show on the website</span></label>

          {busy && <span className="small muted" role="status">{busy}</span>}
          {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
          <div className="row g12">
            <button className="btn btn-p" onClick={save} disabled={pending || !!busy}>{pending ? 'Saving…' : 'Save webinar'}</button>
            <button className="btn btn-t" onClick={() => setF(null)} disabled={pending}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  )
}
