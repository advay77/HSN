import 'server-only'

import { getPayloadClient } from '@/lib/payload'
import { TIER_LABEL, TIER_VALUE } from './people'

// Course registrations and membership interest for the admin Inbox pages and their CSV exports.

const courseOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number; title: string }) : null)

/** "courseId::session" — the Session filter value (session empty = registrations without a session). */
export const sessionKey = (courseId: number | string | undefined, session?: string | null) => `${courseId ?? ''}::${session ?? ''}`

export async function findRegistrations(f: { session?: string; country?: string }) {
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'course-registrations', sort: '-createdAt', pagination: false, depth: 1 })
  const rows = all.docs.map((r) => {
    const course = courseOf(r.course)
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone ?? '',
      role: r.role ?? '',
      org: r.organization ?? '',
      country: r.country ?? '',
      course: course?.title ?? '',
      session: r.session ?? '',
      key: sessionKey(course?.id, r.session),
      label: [course?.title, r.session].filter(Boolean).join(' · ') || '—',
      net: !!r.joinNetwork,
      createdAt: r.createdAt,
    }
  })
  const sessions = [...new Map(rows.map((r) => [r.key, r.label])).entries()].map(([value, label]) => ({ value, label }))
  const shown = rows.filter(
    (r) => (!f.session || f.session === 'all' || r.key === f.session) && (!f.country || f.country === 'all' || r.country === f.country),
  )
  return { total: rows.length, rows: shown, sessions }
}

export async function findInterest(f: { tier?: string; country?: string }) {
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'membership-applications', sort: '-createdAt', pagination: false, depth: 0 })
  const tier = f.tier && TIER_LABEL[f.tier] ? f.tier : f.tier ? TIER_VALUE[f.tier] : undefined
  const rows = all.docs.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    org: a.organization ?? '',
    role: a.role ?? '',
    country: a.country ?? '',
    region: a.region ?? '',
    tier: a.tier,
    message: a.message ?? '',
    payment: a.paymentStatus ?? '',
    createdAt: a.createdAt,
  }))
  const tierCounts = Object.keys(TIER_LABEL).map((t) => ({ tier: t, n: rows.filter((r) => r.tier === t).length }))
  const shown = rows.filter((r) => (!tier || r.tier === tier) && (!f.country || f.country === 'all' || r.country === f.country))
  return { total: rows.length, rows: shown, tierCounts }
}
