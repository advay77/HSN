'use server'

import { getCurrentMember } from '@/lib/auth/session'
import { RATINGS, RECOMMEND, SATISFACTION, type RatingKey, type Recommend, type Satisfaction } from '@/lib/courses/feedback'
import { getCourseBySlug, getEnrollment, progressOf } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'

export type FeedbackInput = {
  courseSlug: string
  delegateName: string
  completionDate: string
  overallSatisfaction: string
  recommend: string
  ratings: Record<RatingKey, number>
  takeaway: string
  application: string
  futureTopics: string
  comments: string
}

const isChoice = <T extends string>(list: readonly { value: T }[], value: string): value is T => list.some((item) => item.value === value)
const clip = (value: string) => value.trim().slice(0, 4000)

export async function submitCourseFeedback(input: FeedbackInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const member = await getCurrentMember()
  if (!member) return { ok: false, error: 'Please log in to send feedback.' }
  if (!(await rateLimit('course-feedback', 8, 60 * 60))) return { ok: false, error: TOO_MANY }

  const course = await getCourseBySlug(input.courseSlug)
  if (!course) return { ok: false, error: 'This course could not be found.' }
  const enrollment = await getEnrollment(member.id, course.id)
  if (progressOf(course, enrollment) < 100) return { ok: false, error: 'Finish the course before sending feedback.' }

  const name = input.delegateName.trim().slice(0, 200)
  if (!name) return { ok: false, error: 'Enter your name.' }
  const completion = input.completionDate.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completion) || Number.isNaN(Date.parse(completion))) return { ok: false, error: 'Enter the date you completed the course.' }
  if (!isChoice<Satisfaction>(SATISFACTION, input.overallSatisfaction)) return { ok: false, error: 'Choose an overall satisfaction rating.' }
  if (!isChoice<Recommend>(RECOMMEND, input.recommend)) return { ok: false, error: 'Say whether you would recommend this course.' }

  const ratings = {} as Record<RatingKey, number>
  for (const item of RATINGS) {
    const score = Number(input.ratings?.[item.key])
    if (!Number.isInteger(score) || score < 1 || score > 5) return { ok: false, error: 'Rate every statement from 1 to 5.' }
    ratings[item.key] = score
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'course-feedback',
    where: { and: [{ member: { equals: member.id } }, { course: { equals: course.id } }] },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return { ok: false, error: 'You have already sent feedback for this course.' }

  await payload.create({
    collection: 'course-feedback',
    data: {
      delegateName: name,
      email: member.email,
      completionDate: new Date(completion).toISOString(),
      courseTitle: course.title,
      course: course.id,
      member: Number(member.id),
      overallSatisfaction: input.overallSatisfaction,
      recommend: input.recommend,
      ...ratings,
      takeaway: clip(input.takeaway),
      application: clip(input.application),
      futureTopics: clip(input.futureTopics),
      comments: clip(input.comments),
    },
  })
  return { ok: true }
}
