import 'server-only'

// A visit is a run of page views from the same person with no gap longer than 30 minutes
// (the usual web-analytics definition). Page views are stored when the person leaves a page.
const GAP_MS = 30 * 60 * 1000

type View = { createdAt: string; seconds?: number | null }

const sorted = (views: View[]) => views.map((v) => new Date(v.createdAt).getTime()).sort((a, b) => a - b)

/** Number of separate visits in one person's page views. */
export function countVisits(views: View[]): number {
  const times = sorted(views)
  let visits = 0
  let last = -Infinity
  for (const t of times) {
    if (t - last > GAP_MS) visits++
    last = t
  }
  return visits
}

/** Visits per section for one person: each section counts once per visit it was opened in. */
export function visitsBySection(views: (View & { section: string })[]): Map<string, number> {
  const list = [...views].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const out = new Map<string, number>()
  let last = -Infinity
  let seen = new Set<string>()
  for (const v of list) {
    const t = new Date(v.createdAt).getTime()
    if (t - last > GAP_MS) seen = new Set()
    last = t
    if (!seen.has(v.section)) {
      seen.add(v.section)
      out.set(v.section, (out.get(v.section) ?? 0) + 1)
    }
  }
  return out
}

/** Groups page views by person: the member when signed in, otherwise the anonymous visitor cookie.
 *  Views from before someone logged in (same browser cookie) count as that member's. */
export function byPerson<T extends View & { member?: unknown; visitor?: string | null }>(views: T[]): Map<string, T[]> {
  const memberOf = (v: T) => (v.member && typeof v.member === 'object' ? (v.member as { id: unknown }).id : v.member) || null
  const cookieToMember = new Map<string, unknown>()
  for (const v of views) if (v.visitor && memberOf(v)) cookieToMember.set(v.visitor, memberOf(v))
  const out = new Map<string, T[]>()
  for (const v of views) {
    const m = memberOf(v) ?? (v.visitor ? cookieToMember.get(v.visitor) : null)
    const key = m ? `m:${m}` : v.visitor ? `v:${v.visitor}` : null
    if (!key) continue
    const list = out.get(key) ?? []
    list.push(v)
    out.set(key, list)
  }
  return out
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
