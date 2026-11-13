'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

export type TeamPerson = {
  id: number
  name: string
  role: string
  bio: string
  photo: string | null
}

const initials = (name: string) => name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export function TeamBoard({ people }: { people: TeamPerson[] }) {
  const [open, setOpen] = useState<TeamPerson | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <div className="stack g32">
      <div className="team-grid">
        {people.map((p) => (
          <button key={p.id} type="button" className="team-card" onClick={() => setOpen(p)}>
            {p.photo ? <img className="team-photo" src={p.photo} alt="" /> : <span className="team-photo team-initials" aria-hidden="true">{initials(p.name)}</span>}
            <span className="team-name">{p.name}</span>
            {p.role && <span className="team-role">{p.role}</span>}
          </button>
        ))}
      </div>

      <dialog ref={dialog} className="team-dlg" aria-labelledby={titleId} onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dialog.current) setOpen(null) }}>
        {open && (
          <div className="team-panel">
            <button type="button" className="team-x" aria-label="Close" onClick={() => setOpen(null)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
            </button>
            {open.photo ? <img className="team-hero" src={open.photo} alt="" /> : <span className="team-hero team-initials" aria-hidden="true">{initials(open.name)}</span>}
            <div className="team-copy stack g12">
              <h2 className="team-dlg-name" id={titleId}>{open.name}</h2>
              {open.role && <p className="team-dlg-role">{open.role}</p>}
              {open.bio.split(/\n\s*\n/).map((para) => para.trim()).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
