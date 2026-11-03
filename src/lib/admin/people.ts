import 'server-only'

import { getPayloadClient } from '@/lib/payload'

// Shared helpers for the admin Members, Registrations and Interest pages.

export const COUNTRIES = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']

export const TIER_LABEL: Record<string, string> = {
  student: 'Student',
  individual: 'Individual Professional',
  institutional: 'Institutional',
}
export const TIER_VALUE: Record<string, string> = Object.fromEntries(Object.entries(TIER_LABEL).map(([v, l]) => [l, v]))
export const TIER_CLS: Record<string, string> = { student: 'bdg b-info', individual: 'bdg b-cat', institutional: 'bdg b-adv' }
export const STATUS_LABEL: Record<string, string> = { none: 'Not a member', pending: 'Pending payment', active: 'Active', expired: 'Expired' }

export const ONLINE_MS = 5 * 60 * 1000
export const isOnline = (lastSeenAt?: string | null) => !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < ONLINE_MS

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')

/** "12 Mar 2026" */
export const fmtDate = (d?: string | null) => {
  if (!d) return '—'
  const x = new Date(d)
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`
}

/** "27 Oct 2026 · 09:58" */
export const fmtDateTime = (d: string) => {
  const x = new Date(d)
  return `${fmtDate(d)} · ${pad(x.getHours())}:${pad(x.getMinutes())}`
}

/** "Today 09:12", "Yesterday", "25 Oct" (with the year when it isn't this year) — as in the admin boards. */
export const fmtWhen = (d: string) => {
  const x = new Date(d)
  const now = new Date()
  const day = (t: Date) => new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
  const diff = Math.round((day(now) - day(x)) / 86400000)
  if (diff === 0) return `Today ${pad(x.getHours())}:${pad(x.getMinutes())}`
  if (diff === 1) return 'Yesterday'
  return `${x.getDate()} ${MONTHS[x.getMonth()]}${x.getFullYear() === now.getFullYear() ? '' : ' ' + x.getFullYear()}`
}

/** Relative "last login": "2 min ago", "1 hr ago", "Yesterday", "3 days ago", "2 weeks ago", else the date. */
export const fmtAgo = (d?: string | null) => {
  if (!d) return 'Never'
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'Just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  const days = Math.round(h / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const w = Math.round(days / 7)
  if (days < 30) return w === 1 ? '1 week ago' : `${w} weeks ago`
  return fmtDate(d)
}

/** "14h 20m", "0h 52m" */
export const fmtHM = (seconds: number) => {
  const m = Math.round(seconds / 60)
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`
}

/** Session length: "42 min", "1h 05m" */
export const fmtSession = (seconds: number) => {
  const m = Math.round(seconds / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${pad(m % 60)}m`
}

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))

export type MemberStats = { seconds: number; top: string; completed: number }

/** Time on site, most viewed section and completed courses for each member (all time). */
export async function getMemberStats(): Promise<Map<number, MemberStats>> {
  const payload = await getPayloadClient()
  const [views, done] = await Promise.all([
    payload.find({
      collection: 'page-views',
      where: { member: { exists: true } },
      pagination: false,
      depth: 0,
      select: { member: true, section: true, seconds: true },
    }),
    payload.find({
      collection: 'enrollments',
      where: { completedAt: { exists: true } },
      pagination: false,
      depth: 0,
      select: { member: true },
    }),
  ])
  const sections = new Map<number, Map<string, number>>()
  for (const v of views.docs) {
    const id = idOf(v.member)
    if (id == null) continue
    const m = sections.get(id) ?? new Map<string, number>()
    m.set(v.section, (m.get(v.section) ?? 0) + (v.seconds ?? 0))
    sections.set(id, m)
  }
  const stats = new Map<number, MemberStats>()
  const get = (id: number) => stats.get(id) ?? { seconds: 0, top: '—', completed: 0 }
  for (const [id, m] of sections) {
    const entries = [...m.entries()].sort((a, b) => b[1] - a[1])
    stats.set(id, { ...get(id), seconds: entries.reduce((s, [, n]) => s + n, 0), top: entries[0]?.[1] ? entries[0][0] : '—' })
  }
  for (const e of done.docs) {
    const id = idOf(e.member)
    if (id == null) continue
    const s = get(id)
    stats.set(id, { ...s, completed: s.completed + 1 })
  }
  return stats
}

/** CSV download response (UTF-8 with BOM so Excel shows Arabic and accents correctly). */
export function csvResponse(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    // Neutralise spreadsheet formulas in user-entered text.
    // Phone numbers like "+91 98…" stay as they are.
    const safe = /^[=@\t\r]/.test(s) || /^[+-](?![\d\s()]+$)/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  const body = '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export const todayStamp = () => new Date().toISOString().slice(0, 10)
