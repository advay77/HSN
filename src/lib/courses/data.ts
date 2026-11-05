import 'server-only'

import type { Course, Enrollment, Media } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export type Lesson = NonNullable<NonNullable<NonNullable<Course['modules']>[number]['lessons']>[number]>
export type Module = NonNullable<Course['modules']>[number]

export const media = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)

// Label shown on the Course page module list.
export function topicKind(l: Lesson): string {
  switch (l.type) {
    case 'diagram':
      return 'Diagram'
    case 'video':
      return 'Video'
    case 'references':
      return 'Reading'
    case 'document':
      return 'Tutorial'
    case 'summary':
      return 'Summary'
    case 'quiz':
      return 'Quiz'
    default:
      return 'Lesson'
  }
}

// Label shown under each lesson in the Player outline.
export function playerKind(l: Lesson): string {
  if (l.type === 'reflection') return 'Reflection'
  if (l.type === 'quiz') return `Quiz · ${l.questions?.length ?? 0} questions`
  return topicKind(l)
}

export const isQuiz = (l: Lesson) => l.type === 'quiz'

/** Modules shown on the site (hidden ones removed). */
export const visibleModules = (c: Course) => (c.modules ?? []).filter((m) => m.status !== 'hidden')
export const availableModules = (c: Course) => (c.modules ?? []).filter((m) => m.status === 'available')

/** Every lesson a learner can open, in order, across available modules. */
export const playableLessons = (c: Course) => availableModules(c).flatMap((m) => m.lessons ?? [])

export const hasVideo = (c: Course) => playableLessons(c).some((l) => l.type === 'video')

export function moduleMeta(m: Module): string {
  const ls = m.lessons ?? []
  const lessons = ls.filter((l) => !isQuiz(l)).length
  const videos = ls.filter((l) => l.type === 'video').length
  const quizzes = ls.filter(isQuiz).map((l) => l.title)
  const parts: string[] = []
  if (lessons) parts.push(`${lessons} ${lessons === 1 ? 'lesson' : 'lessons'}`)
  if (videos) parts.push(`${videos} ${videos === 1 ? 'video' : 'videos'}`)
  parts.push(...quizzes)
  return parts.length ? parts.join(' · ') : 'Lessons will be added soon'
}

/** Pass threshold for a quiz with n questions. */
export const passNeeded = (c: Course, n: number) => Math.ceil(((c.certificate?.passMark ?? 80) / 100) * n)

export function youtubeId(v: string | null | undefined): string | null {
  if (!v) return null
  const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  if (m) return m[1]!
  return /^[\w-]{11}$/.test(v.trim()) ? v.trim() : null
}

export async function getPublishedCourses(): Promise<Course[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'courses',
    where: { published: { equals: true } },
    sort: 'order',
    limit: 200,
    depth: 1,
  })
  return res.docs
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'courses',
    where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export async function getEnrollment(memberId: string | number, courseId: string | number): Promise<Enrollment | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'enrollments',
    where: { and: [{ member: { equals: memberId } }, { course: { equals: courseId } }] },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] ?? null
}

export async function getEnrollmentsFor(memberId: string | number): Promise<Enrollment[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'enrollments',
    where: { member: { equals: memberId } },
    limit: 500,
    depth: 0,
  })
  return res.docs
}

export async function getOrCreateEnrollment(memberId: string | number, courseId: string | number): Promise<Enrollment> {
  const existing = await getEnrollment(memberId, courseId)
  if (existing) return existing
  const payload = await getPayloadClient()
  return payload.create({
    collection: 'enrollments',
    data: { member: memberId as number, course: courseId as number, completedLessons: [], quizResults: {}, progress: 0 },
  })
}

export type QuizResult = { score: number; total: number; passed: boolean; at: string; attempts?: number }

export const completedIds = (e: Enrollment | null): string[] =>
  Array.isArray(e?.completedLessons) ? (e!.completedLessons as string[]) : []
export const quizResults = (e: Enrollment | null): Record<string, QuizResult> =>
  e?.quizResults && typeof e.quizResults === 'object' && !Array.isArray(e.quizResults)
    ? (e.quizResults as Record<string, QuizResult>)
    : {}

export const progressOf = (c: Course, e: Enrollment | null) => {
  const all = playableLessons(c)
  if (!all.length) return 0
  const done = new Set(completedIds(e))
  return Math.round((all.filter((l) => l.id && done.has(l.id)).length / all.length) * 100)
}
