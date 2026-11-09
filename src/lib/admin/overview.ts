import 'server-only'

import { initialsOf } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'

import { sectionOf } from '@/lib/sections'

import { byPerson, countVisits, visitsBySection } from './visits'

const DAY = 24 * 60 * 60 * 1000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const iso = (d: Date) => d.toISOString()

const ACTIVITY_TEXT: Record<string, (detail?: string | null) => string> = {
  login: () => 'logged in',
  signup: () => 'joined HSN',
  lesson: (d) => (d ? `completed a lesson in ${d}` : 'completed a lesson'),
  'quiz-pass': (d) => (d ? `passed a quiz in ${d}` : 'passed a quiz'),
  'course-complete': (d) => (d ? `completed ${d}` : 'completed a course'),
  'course-registration': (d) => (d ? `registered for ${d}` : 'registered for a course'),
  'case-submitted': () => 'submitted a case study',
  membership: (d) => `registered for ${d === 'individual' ? 'Individual Professional' : d === 'institutional' ? 'Institutional' : 'Student'} membership`,
}
const ACTIVITY_COLOR: Record<string, string> = {
  login: '#4FAE4E',
  signup: '#4FAE4E',
  lesson: '#4FAE4E',
  'quiz-pass': '#4FAE4E',
  'course-complete': '#4FAE4E',
  'course-registration': '#5BC0E3',
  'case-submitted': '#E0A526',
  membership: '#E0A526',
}

export function timeAgo(date: string | Date, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.round(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

const firstName = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return /^(dr|prof)\.?$/i.test(parts[0] ?? '') && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0] ?? name
}

export async function getOverview() {
  const payload = await getPayloadClient()
  const now = new Date()
  const today = startOfDay(now)
  const weekAgo = new Date(now.getTime() - 7 * DAY)
  const twoWeeksAgo = new Date(now.getTime() - 14 * DAY)
  const first = new Date(today.getTime() - 13 * DAY)

  const count = (collection: 'members' | 'case-studies' | 'course-registrations' | 'membership-applications' | 'course-feedback' | 'site-feedback', where = {}) =>
    payload.count({ collection, where }).then((r) => r.totalDocs)

  const [total, newWeek, newPrevWeek, online, activeToday, active7, pendingCases, regsWeek, interestWeek, feedbackWeek, siteFeedbackNew] = await Promise.all([
    count('members'),
    count('members', { createdAt: { greater_than: iso(weekAgo) } }),
    count('members', { and: [{ createdAt: { greater_than: iso(twoWeeksAgo) } }, { createdAt: { less_than_equal: iso(weekAgo) } }] }),
    count('members', { lastSeenAt: { greater_than: iso(new Date(now.getTime() - 5 * 60 * 1000)) } }),
    count('members', { lastSeenAt: { greater_than_equal: iso(today) } }),
    count('members', { lastSeenAt: { greater_than: iso(weekAgo) } }),
    count('case-studies', { status: { equals: 'submitted' } }),
    count('course-registrations', { createdAt: { greater_than: iso(weekAgo) } }),
    count('membership-applications', { createdAt: { greater_than: iso(weekAgo) } }),
    count('course-feedback', { createdAt: { greater_than: iso(weekAgo) } }),
    count('site-feedback', { read: { not_equals: true } }),
  ])

  // Logins per day, last 14 days (today last).
  const logins = await payload.find({
    collection: 'activity',
    where: { and: [{ type: { equals: 'login' } }, { createdAt: { greater_than_equal: iso(first) } }] },
    pagination: false,
    depth: 0,
    select: { createdAt: true },
  })
  const perDay = Array.from({ length: 14 }, (_, i) => ({ date: new Date(first.getTime() + i * DAY), v: 0 }))
  for (const l of logins.docs) {
    const i = Math.floor((startOfDay(new Date(l.createdAt)).getTime() - first.getTime()) / DAY)
    if (perDay[i]) perDay[i].v++
  }

  const feedRows = await payload.find({ collection: 'activity', sort: '-createdAt', limit: 7, depth: 1 })
  const feed = feedRows.docs.map((a) => {
    const m = a.member && typeof a.member === 'object' ? a.member : null
    const name = m?.name ?? 'A visitor'
    return {
      id: a.id,
      i: m ? initialsOf(name) : '?',
      who: firstName(name),
      what: (ACTIVITY_TEXT[a.type] ?? (() => a.type))(a.detail),
      when: timeAgo(a.createdAt),
      bg: ACTIVITY_COLOR[a.type] ?? '#5BC0E3',
    }
  })

  // Page views, last 30 days: visits, visitors, and the most viewed sections (total time and visits).
  const views = await payload.find({
    collection: 'page-views',
    where: { createdAt: { greater_than: iso(new Date(now.getTime() - 30 * DAY)) } },
    pagination: false,
    depth: 0,
    select: { section: true, seconds: true, member: true, visitor: true, createdAt: true, from: true, referrer: true },
  })
  const people = byPerson(views.docs)
  const bySection = new Map<string, { seconds: number; visits: number }>()
  for (const v of views.docs) {
    const s = bySection.get(v.section) ?? { seconds: 0, visits: 0 }
    s.seconds += v.seconds ?? 0
    bySection.set(v.section, s)
  }
  let visits = 0
  const memberVisits: { id: number; visits: number; seconds: number }[] = []
  for (const [key, list] of people) {
    const n = countVisits(list)
    visits += n
    for (const [section, c] of visitsBySection(list)) bySection.get(section)!.visits += c
    if (key.startsWith('m:')) memberVisits.push({ id: Number(key.slice(2)), visits: n, seconds: list.reduce((s, v) => s + (v.seconds ?? 0), 0) })
  }
  const sections = [...bySection.entries()]
    .map(([name, s]) => ({ name, seconds: s.seconds, visits: s.visits }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 7)
  const totalSeconds = views.docs.reduce((s, v) => s + (v.seconds ?? 0), 0)
  const top = memberVisits.sort((a, b) => b.visits - a.visits || b.seconds - a.seconds).slice(0, 5)
  const names = top.length
    ? await payload.find({ collection: 'members', where: { id: { in: top.map((t) => t.id) } }, pagination: false, depth: 0, select: { name: true } })
    : { docs: [] as { id: number; name: string }[] }
  // Where visits start (outside site or direct) and the most common moves from one section to another.
  const tally = <K,>(keys: K[]) => {
    const m = new Map<K, number>()
    for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const sources = tally(views.docs.filter((v) => !v.from).map((v) => v.referrer || 'Direct')).slice(0, 6)
  const paths = tally(
    views.docs
      .map((v) => (v.from ? [sectionOf(v.from), v.section] : null))
      .filter((p): p is [string, string] => !!p && !!p[0] && p[0] !== p[1])
      .map(([a, b]) => `${a} → ${b}`),
  ).slice(0, 6)
  const clickRows = await payload.find({
    collection: 'click-events',
    where: { createdAt: { greater_than: iso(new Date(now.getTime() - 30 * DAY)) } },
    pagination: false,
    depth: 0,
    select: { label: true, path: true },
  })
  const topClicks = tally(clickRows.docs.map((c) => `${c.label}\u0000${sectionOf(c.path) ?? c.path}`))
    .slice(0, 7)
    .map(([k, n]) => ({ label: k.split('\u0000')[0]!, section: k.split('\u0000')[1]!, count: n }))
  const traffic = {
    clicks: clickRows.docs.length,
    topClicks,
    sources,
    paths,
    visits,
    visitors: people.size,
    pageViews: views.docs.length,
    avgVisit: visits ? Math.round(totalSeconds / visits) : 0,
    topMembers: top
      .map((t) => ({ ...t, name: names.docs.find((d) => Number(d.id) === t.id)?.name }))
      .filter((t): t is typeof t & { name: string } => !!t.name),
  }

  return {
    total,
    newWeek,
    newPrevWeek,
    online,
    activeToday,
    active7,
    perDay,
    feed,
    sections,
    traffic,
    pendingCases,
    regsWeek,
    interestWeek,
    feedbackWeek,
    siteFeedbackNew,
  }
}

export const formatDuration = (seconds: number) => {
  if (seconds >= 3600) return `${Math.round(seconds / 360) / 10} h`
  if (seconds >= 60) return `${Math.round(seconds / 60)} min`
  return `${Math.round(seconds)} s`
}
