'use client'

import React, { useTransition } from 'react'

import { restartNumberingAction } from '@/app/(frontend)/admin/certificates/actions'

// "Restart numbering at 0001" for launch day, with a clear confirmation first.
export function RestartNumbering({ next }: { next: number }) {
  const [pending, start] = useTransition()
  const restart = () => {
    if (!window.confirm('Restart certificate numbers at 0001?\n\nThe next certificate issued will be number 0001. Certificates issued so far keep working and can still be verified, but they leave the numbering.\n\nUse this once, on launch day.')) return
    start(() => restartNumberingAction())
  }
  return (
    <div className="card pad stack g8" style={{ maxWidth: '820px' }}>
      <strong>Certificate numbers</strong>
      <span className="small muted">
        Every completed course gets the next number: 0001, 0002, 0003… The number appears in the certificate ID with the month and year, for example HSN-NOV2026-0001-482913.
      </span>
      <span className="small">The next certificate will be number <strong>{String(next).padStart(4, '0')}</strong>.</span>
      <button type="button" className="btn btn-s btn-sm self-start" onClick={restart} disabled={pending || next === 1}>
        {pending ? 'Restarting…' : next === 1 ? 'Numbering starts at 0001' : 'Restart numbering at 0001 (launch day)'}
      </button>
    </div>
  )
}
