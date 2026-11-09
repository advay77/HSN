import 'server-only'

import { getPayloadClient } from '@/lib/payload'

import { labelOf, SATISFACTION } from './feedback'

export type Testimonial = { id: number; quote: string; name: string; rating: string }
export type FeedbackSummary = { responses: number; recommendPct: number; averageRating: number } | null

const RATING_KEYS = ['objectivesClear', 'contentRelevant', 'structuredLogically', 'lengthPace', 'examplesHelpful', 'platformEasy', 'mediaClear', 'quizzesHelpful'] as const

// "Priya Sharma" → "Priya S." so a full name is never shown.
const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.` : parts[0] || 'Learner'
}

/** Feedback the learner agreed to share and the admin chose to show, plus anonymous totals (from 3 responses). */
export async function courseTestimonials(courseId: number): Promise<{ items: Testimonial[]; summary: FeedbackSummary }> {
  const payload = await getPayloadClient()
  const all = await payload.find({ collection: 'course-feedback', where: { course: { equals: courseId } }, limit: 500, depth: 0, overrideAccess: true })
  const items = all.docs
    .filter((d) => d.sharePublicly && d.showOnSite && (d.takeaway?.trim() || d.comments?.trim()))
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      quote: (d.takeaway?.trim() || d.comments!.trim()).slice(0, 400),
      name: shortName(d.delegateName),
      rating: labelOf(SATISFACTION, d.overallSatisfaction),
    }))
  const n = all.docs.length
  const summary: FeedbackSummary =
    n >= 3
      ? {
          responses: n,
          recommendPct: Math.round((all.docs.filter((d) => d.recommend === 'yes').length / n) * 100),
          averageRating: Math.round((all.docs.reduce((s, d) => s + RATING_KEYS.reduce((t, k) => t + (Number(d[k]) || 0), 0) / RATING_KEYS.length, 0) / n) * 10) / 10,
        }
      : null
  return { items, summary }
}
