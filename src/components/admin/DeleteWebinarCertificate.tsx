'use client'

import React, { useState, useTransition } from 'react'

import { deleteWebinarCertificate } from '@/app/(frontend)/admin/certificates/webinar/actions'

// For a certificate issued by mistake, such as a duplicate. Asks first; deleted certificates do not come back.
export function DeleteWebinarCertificate({ id, label, small = false }: { id: number; label: string; small?: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const remove = () => {
    if (!window.confirm(`Delete certificate ${label}?\n\nOnly do this for a certificate issued by mistake that nobody has received. It cannot be undone.`)) return
    setError('')
    start(async () => {
      const res = await deleteWebinarCertificate(id)
      if (res?.error) setError(res.error)
    })
  }
  return (
    <span className="stack g4">
      <button type="button" className={small ? 'btn btn-g btn-sm' : 'btn btn-g'} onClick={remove} disabled={pending}>{pending ? 'Deleting…' : 'Delete'}</button>
      {error && <span className="small" role="alert" style={{ color: '#B42318' }}>{error}</span>}
    </span>
  )
}
