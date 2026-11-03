import 'server-only'

import { getPayloadClient } from '@/lib/payload'
import { getMemberStats, isOnline, TIER_LABEL, TIER_VALUE } from './people'

export const PAGE_SIZE = 25
export const SORT_KEYS = ['name', 'joined', 'last', 'time', 'courses'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export type MemberFilter = { q?: string; tier?: string; country?: string; sort?: string; dir?: string; page?: string }

export type MemberRow = {
  id: number
  name: string
  email: string
  org: string
  country: string
  tier: string | null
  joined: string
  lastLoginAt: string | null
  online: boolean
  blocked: boolean
  top: string
  seconds: number
  completed: number
  phone: string
  role: string
  status: string | null
}

/**
 * Every member matching the filter, sorted. Members are filtered and sorted in memory so time on site and
 * courses completed (which live in other collections) can be sorted on too.
 */
export async function findMembers(f: MemberFilter) {
  const payload = await getPayloadClient()
  const [all, stats] = await Promise.all([
    payload.find({ collection: 'members', pagination: false, depth: 0, sort: '-createdAt' }),
    getMemberStats(),
  ])
  const total = all.docs.length
  const online = all.docs.filter((m) => !m.blocked && isOnline(m.lastSeenAt)).length

  const q = (f.q ?? '').trim().toLowerCase()
  const tier = f.tier && TIER_VALUE[f.tier] ? TIER_VALUE[f.tier] : f.tier && TIER_LABEL[f.tier] ? f.tier : null
  let rows: MemberRow[] = all.docs.map((m) => {
    const s = stats.get(m.id)
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      org: m.organization ?? '',
      country: m.country ?? '',
      tier: m.membershipTier ?? null,
      joined: m.createdAt,
      lastLoginAt: m.lastLoginAt ?? null,
      online: isOnline(m.lastSeenAt),
      blocked: !!m.blocked,
      top: s?.top ?? '—',
      seconds: s?.seconds ?? 0,
      completed: s?.completed ?? 0,
      phone: [m.phoneCountryCode, m.phone].filter(Boolean).join(' '),
      role: m.role ?? '',
      status: m.membershipStatus ?? null,
    }
  })
  rows = rows.filter(
    (r) =>
      (!q || [r.name, r.email, r.org, r.country, r.tier ? TIER_LABEL[r.tier] : ''].join(' ').toLowerCase().includes(q)) &&
      (!tier || r.tier === tier) &&
      (!f.country || f.country === 'all' || r.country === f.country),
  )

  const key: SortKey = (SORT_KEYS as readonly string[]).includes(f.sort ?? '') ? (f.sort as SortKey) : 'last'
  const dir: 'asc' | 'desc' = f.dir === 'desc' ? 'desc' : 'asc'
  // "asc" on Last login means most recent first, as in the board (it sorts by "time ago").
  const val = (r: MemberRow): string | number =>
    key === 'name'
      ? r.name.toLowerCase()
      : key === 'joined'
        ? new Date(r.joined).getTime()
        : key === 'last'
          ? r.lastLoginAt ? -new Date(r.lastLoginAt).getTime() : Number.MAX_SAFE_INTEGER
          : key === 'time'
            ? r.seconds
            : r.completed
  rows.sort((x, y) => {
    const a = val(x)
    const b = val(y)
    const c = typeof a === 'string' ? a.localeCompare(String(b)) : a - (b as number)
    return dir === 'asc' ? c : -c
  })
  return { rows, total, online, key, dir }
}
