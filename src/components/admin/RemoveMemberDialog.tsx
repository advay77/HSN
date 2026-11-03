'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'

import { removeMemberAction } from '@/app/(frontend)/admin/members/actions'

// The "Remove {name}?" confirm from AdminMembers.dc.html. Fixed to the screen so it is centred however far
// the list is scrolled (the board positions it inside its frame).
export function RemoveMemberDialog({ id, name, onCancel, onRemoved }: { id: number; name: string; onCancel: () => void; onRemoved: (name: string) => void }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>()
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])
  const remove = () =>
    start(async () => {
      const r = await removeMemberAction(id)
      if (r.ok) onRemoved(r.name ?? name)
      else setError(r.error)
    })
  return (
    <div className="scrim" style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
      <div className="modal e2" role="alertdialog" aria-modal="true" aria-labelledby="rm-h" aria-describedby="rm-d" style={{ maxWidth: '520px' }}>
        <div className="stack g16" style={{ padding: '28px' }}>
          <span className="ic" style={{ background: '#FBE4E1', color: '#B3261E' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M10 11v6M14 11v6"></path><path d="M6 7l1 13h10l1-13"></path><path d="M9 7V4h6v3"></path></svg></span>
          <h2 className="h3" id="rm-h" style={{ margin: 0 }}>Remove {name}?</h2>
          <p id="rm-d" style={{ margin: 0 }}>This permanently deletes{' '}<strong>{name}</strong>’s account, course progress and registrations. It can’t be undone. To stop them logging in but keep their data, block them instead.</p>
          {error && <p className="emsg" role="alert">{error}</p>}
          <div className="row g12" style={{ justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button ref={cancelRef} className="btn btn-s" onClick={onCancel} disabled={pending}>Cancel</button>
            <button className="btn btn-danger" onClick={remove} disabled={pending}>Remove {name}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
