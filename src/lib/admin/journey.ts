import 'server-only'

// One person's visits as page-by-page journeys, with the clicks made on each page (see visits.ts for what a visit is).
const GAP_MS = 30 * 60 * 1000

type View = { createdAt: string; seconds?: number | null; path?: string | null; section: string; referrer?: string | null }
type Click = { createdAt: string; path: string; label: string; target?: string | null }

export type JourneyStep = { at: string; section: string; path: string; seconds: number; clicks: { label: string; target: string }[] }
export type Journey = { start: string; source: string; seconds: number; clicks: number; steps: JourneyStep[] }

const t = (d: string) => new Date(d).getTime()

/** The most recent `limit` visits, newest first; steps inside a visit run in order. */
export function buildJourneys(views: View[], clicks: Click[], limit = 5): Journey[] {
  const sorted = [...views].sort((a, b) => t(a.createdAt) - t(b.createdAt))
  const visits: View[][] = []
  let last = -Infinity
  for (const v of sorted) {
    if (t(v.createdAt) - last > GAP_MS) visits.push([])
    visits[visits.length - 1]!.push(v)
    last = t(v.createdAt)
  }
  const recent = visits.slice(-limit).reverse()
  return recent.map((list) => {
    // A view is stored when the person leaves the page, so the page opened `seconds` before that.
    const steps: JourneyStep[] = list.map((v) => ({
      at: new Date(t(v.createdAt) - (v.seconds ?? 0) * 1000).toISOString(),
      section: v.section,
      path: v.path || '',
      seconds: v.seconds ?? 0,
      clicks: [],
    }))
    const from = t(steps[0]!.at) - 60_000
    const to = t(list[list.length - 1]!.createdAt) + 60_000
    let count = 0
    for (const c of clicks) {
      const ct = t(c.createdAt)
      if (ct < from || ct > to) continue
      // The page the click happened on: same path, opened before the click, latest such.
      const step = [...steps].reverse().find((s) => s.path === c.path && t(s.at) <= ct + 5000)
      if (step) {
        step.clicks.push({ label: c.label, target: c.target || '' })
        count++
      }
    }
    return {
      start: steps[0]!.at,
      source: list[0]!.referrer || 'Direct',
      seconds: list.reduce((s, v) => s + (v.seconds ?? 0), 0),
      clicks: count,
      steps,
    }
  })
}
