'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { setBlockedAction, updateMembershipAction } from '@/app/(frontend)/admin/members/actions'
import { RemoveMemberDialog } from './RemoveMemberDialog'

// Email / Block / Remove buttons on the member profile card (AdminMember.dc.html).
export function MemberActions({ id, name, email, blocked }: { id: number; name: string; email: string; blocked: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirm, setConfirm] = useState(false)
  const toggleBlock = () => {
    if (!blocked && !window.confirm(`Block ${name}? They won’t be able to log in until you unblock them.`)) return
    start(async () => {
      await setBlockedAction(id, !blocked)
      router.refresh()
    })
  }
  return (
    <div className="row g8">
      <a className="btn btn-g btn-sm" href={`mailto:${email}`}>Email</a>
      <button className="btn btn-g btn-sm" onClick={toggleBlock} disabled={pending}>{blocked ? 'Unblock' : 'Block'}</button>
      <button className="btn btn-dl btn-sm" onClick={() => setConfirm(true)}>Remove</button>
      {confirm && (
        <RemoveMemberDialog
          id={id}
          name={name}
          onCancel={() => setConfirm(false)}
          onRemoved={(n) => router.push(`/admin/members?removed=${encodeURIComponent(n)}`)}
        />
      )}
    </div>
  )
}

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ top: '13px' }}><path d="m6 9 6 6 6-6"></path></svg>
)

// Membership tier/status and the private admin note. Not in the board; uses the design system's form parts.
export function MembershipForm({ id, tier, status, note }: { id: number; tier: string; status: string; note: string }) {
  const router = useRouter()
  const [v, setV] = useState({ tier, status, note })
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>()
  const [pending, start] = useTransition()
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(undefined)
    start(async () => {
      const r = await updateMembershipAction(id, v)
      setMsg(r.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: r.error })
      if (r.ok) router.refresh()
    })
  }
  return (
    <form className="stack g16" onSubmit={save}>
      <div className="grid c2" style={{ gap: '16px' }}>
        <div className="fld"><label className="lbl" htmlFor="mm-tier">Tier</label><span className="sel"><select className="inp" id="mm-tier" value={v.tier} onChange={(e) => setV({ ...v, tier: e.target.value })}><option value="">No tier</option><option value="student">Student</option><option value="individual">Individual Professional</option><option value="institutional">Institutional</option></select><Chevron /></span></div>
        <div className="fld"><label className="lbl" htmlFor="mm-status">Status</label><span className="sel"><select className="inp" id="mm-status" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })}><option value="none">Not a member</option><option value="pending">Pending payment</option><option value="active">Active</option><option value="expired">Expired</option></select><Chevron /></span></div>
      </div>
      <div className="fld"><label className="lbl" htmlFor="mm-note">Private note <span className="opt-t">(only admins see this)</span></label><textarea className="inp" id="mm-note" rows={4} style={{ minHeight: '110px' }} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></div>
      <div className="row g12">
        <button className="btn btn-p btn-sm" type="submit" disabled={pending}>Save changes</button>
        {msg && (msg.ok ? <span className="small strong" role="status" style={{ color: '#1B6E3F' }}>{msg.text}</span> : <span className="emsg" role="alert">{msg.text}</span>)}
      </div>
    </form>
  )
}
