import 'server-only'

import { getPayloadClient } from '@/lib/payload'

// Summary of the built-in "Course Completion Delegate Feedback Form" answers for one course, for the Feedback
// tab of the admin course editor. The questions match HSN's Word template (sections 1–5).

export const FEEDBACK_SECTIONS = {
  overall: { label: 'Overall satisfaction', options: [['excellent', 'Excellent'], ['good', 'Good'], ['average', 'Average'], ['below-average', 'Below Average'], ['poor', 'Poor']] as const },
  recommend: { label: 'Would recommend to a colleague', options: [['yes', 'Yes, definitely'], ['maybe', 'Maybe'], ['no', 'No']] as const },
  content: [
    ['objectivesClear', 'The learning objectives were clear and met.'],
    ['contentRelevant', 'The course content was relevant to my professional role.'],
    ['structuredLogically', 'The topics were structured logically and easy to follow.'],
    ['lengthPace', 'The course length and pace were appropriate.'],
    ['examplesHelpful', 'Practical examples/case studies were helpful.'],
  ] as const,
  platform: [
    ['platformEasy', 'The online platform was user-friendly and easy to navigate.'],
    ['mediaClear', 'Video quality, audio, and visual materials were clear.'],
    ['quizzesHelpful', 'Quizzes/knowledge checks reinforced my learning.'],
  ] as const,
  open: [
    ['takeaway', 'What was the most valuable takeaway or topic from this course?'],
    ['application', 'How do you plan to apply what you learned in your daily work/facility?'],
    ['futureTopics', 'What additional topics or advanced modules would you like to see in the future?'],
    ['comments', 'Suggestions or general feedback to help us improve future courses'],
  ] as const,
}

export type FeedbackCount = { label: string; count: number }
export type FeedbackAverage = { label: string; avg: number | null }
export type FeedbackAnswer = { id: number; name: string; text: string }

export type CourseFeedbackSummary = {
  total: number
  overall: FeedbackCount[]
  recommend: FeedbackCount[]
  content: FeedbackAverage[]
  platform: FeedbackAverage[]
  open: { question: string; answers: FeedbackAnswer[] }[]
  latest: { id: number; name: string; overall: string; when: string }[]
}

type Row = Record<string, unknown> & { id: number; delegateName: string; createdAt: string }

const avg = (rows: Row[], key: string) => {
  const vals = rows.map((r) => Number(r[key])).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export async function getCourseFeedbackSummary(courseId: number | null): Promise<CourseFeedbackSummary | null> {
  if (!courseId) return null
  const payload = await getPayloadClient()
  const found = await payload.find({ collection: 'course-feedback', where: { course: { equals: courseId } }, sort: '-createdAt', pagination: false, depth: 0 })
  const rows = found.docs as unknown as Row[]
  const label = (opts: readonly (readonly [string, string])[], v: unknown) => opts.find(([k]) => k === v)?.[1] ?? String(v ?? '')
  return {
    total: rows.length,
    overall: FEEDBACK_SECTIONS.overall.options.map(([k, l]) => ({ label: l, count: rows.filter((r) => r.overallSatisfaction === k).length })),
    recommend: FEEDBACK_SECTIONS.recommend.options.map(([k, l]) => ({ label: l, count: rows.filter((r) => r.recommend === k).length })),
    content: FEEDBACK_SECTIONS.content.map(([k, l]) => ({ label: l, avg: avg(rows, k) })),
    platform: FEEDBACK_SECTIONS.platform.map(([k, l]) => ({ label: l, avg: avg(rows, k) })),
    open: FEEDBACK_SECTIONS.open.map(([k, q]) => ({
      question: q,
      answers: rows.filter((r) => typeof r[k] === 'string' && (r[k] as string).trim()).slice(0, 5).map((r) => ({ id: r.id, name: r.delegateName, text: (r[k] as string).trim() })),
    })),
    latest: rows.slice(0, 8).map((r) => ({ id: r.id, name: r.delegateName, overall: label(FEEDBACK_SECTIONS.overall.options, r.overallSatisfaction), when: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })),
  }
}
