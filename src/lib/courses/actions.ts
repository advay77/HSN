'use server'

import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'

import {
  completedIds,
  getOrCreateEnrollment,
  isQuiz,
  passNeeded,
  playableLessons,
  progressOf,
  quizResults,
  type QuizResult,
} from './data'
import { sendRegistrationEmail } from './notify'

async function loadCourse(courseId: number) {
  const payload = await getPayloadClient()
  const course = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 }).catch(() => null)
  if (!course || !course.published) throw new Error('Course not found')
  return { payload, course }
}

async function requireMember() {
  const member = await getCurrentMember()
  if (!member) throw new Error('Please log in')
  return member
}

/** Save for later / unsave. Returns the new state. */
export async function toggleSaveCourse(courseId: number): Promise<boolean> {
  const member = await requireMember()
  const { payload } = await loadCourse(courseId)
  const e = await getOrCreateEnrollment(member.id, courseId)
  const saved = !e.savedForLater
  await payload.update({ collection: 'enrollments', id: e.id, data: { savedForLater: saved } })
  return saved
}

/** The first earlier lesson (or quiz) this member has not finished yet; lessons are done in order. */
function earlierUnfinished(course: Parameters<typeof playableLessons>[0], e: Parameters<typeof completedIds>[0], lessonId: string) {
  const all = playableLessons(course)
  const pos = all.findIndex((l) => l.id === lessonId)
  const done = new Set(completedIds(e))
  return all.slice(0, Math.max(0, pos)).find((l) => l.id && !done.has(l.id)) ?? null
}

/** Marks a lesson complete (quizzes are completed only by passing them). Returns the new progress %. */
export async function completeLesson(courseId: number, lessonId: string): Promise<{ progress: number; completed: string[] }> {
  const member = await requireMember()
  const { payload, course } = await loadCourse(courseId)
  const lesson = playableLessons(course).find((l) => l.id === lessonId)
  if (!lesson || isQuiz(lesson)) throw new Error('Lesson not found')
  const e = await getOrCreateEnrollment(member.id, courseId)
  if (earlierUnfinished(course, e, lessonId)) throw new Error('Finish the earlier lessons first')
  const completed = Array.from(new Set([...completedIds(e), lessonId]))
  const next = { ...e, completedLessons: completed }
  const progress = progressOf(course, next)
  await payload.update({
    collection: 'enrollments',
    id: e.id,
    data: { completedLessons: completed, progress, ...(progress === 100 && !e.completedAt ? { completedAt: new Date().toISOString() } : {}) },
  })
  return { progress, completed }
}

export type QuizOutcome = QuizResult & { correct: number[]; progress: number; completed: string[]; canRetake: boolean }

/** Scores a quiz on the server; correct answers are only revealed after submitting. */
export async function submitQuiz(courseId: number, lessonId: string, answers: number[]): Promise<QuizOutcome> {
  const member = await requireMember()
  const { payload, course } = await loadCourse(courseId)
  const lesson = playableLessons(course).find((l) => l.id === lessonId)
  if (!lesson || !isQuiz(lesson)) throw new Error('Quiz not found')
  const e = await getOrCreateEnrollment(member.id, courseId)
  if (earlierUnfinished(course, e, lessonId)) throw new Error('Finish the earlier lessons first')
  const results = quizResults(e)
  const maxAttempts = course.certificate?.retakes === false ? 1 : course.certificate?.maxAttempts || 0
  const qs = lesson.questions ?? []
  const correct = qs.map((q) => Math.max(0, (q.options ?? []).findIndex((o) => o.correct)))

  const prev = results[lessonId]
  const used = prev ? prev.attempts ?? 1 : 0
  if (prev && (prev.passed || (maxAttempts > 0 && used >= maxAttempts))) {
    return { ...prev, correct, progress: e.progress ?? 0, completed: completedIds(e), canRetake: false }
  }

  const score = qs.filter((_, i) => answers[i] === correct[i]).length
  const passed = score >= passNeeded(course, qs.length)
  const attempts = used + 1
  const canRetake = !passed && (maxAttempts === 0 || attempts < maxAttempts)
  const result: QuizResult = { score, total: qs.length, passed, at: new Date().toISOString(), attempts }
  let completed = completedIds(e)
  if (passed) completed = Array.from(new Set([...completed, lessonId]))
  const progress = progressOf(course, { ...e, completedLessons: completed })
  await payload.update({
    collection: 'enrollments',
    id: e.id,
    data: {
      completedLessons: completed,
      quizResults: { ...results, [lessonId]: result },
      progress,
      ...(progress === 100 && !e.completedAt ? { completedAt: new Date().toISOString() } : {}),
    },
  })
  return { ...result, correct, progress, completed, canRetake }
}

export type RegisterInput = {
  courseSlug: string
  name: string
  email: string
  phoneCode: string
  phone: string
  role: string
  organization: string
  country: string
  session: string
  joinNetwork: boolean
}

export type RegisterResult =
  | { ok: true; emailed: boolean; session: string }
  | { ok: false; errors: Partial<Record<keyof RegisterInput, string>> }

const COUNTRIES = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']

export async function registerForCourse(input: RegisterInput): Promise<RegisterResult> {
  if (!(await rateLimit('course-register', 10, 60 * 60))) return { ok: false, errors: { email: TOO_MANY } }
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'courses',
    where: { and: [{ slug: { equals: input.courseSlug } }, { published: { equals: true } }] },
    limit: 1,
    depth: 0,
  })
  const course = res.docs[0]
  if (!course) return { ok: false, errors: { courseSlug: 'This course is not open for registration.' } }

  const s = (v: unknown) => String(v ?? '').trim().slice(0, 300)
  const v = {
    name: s(input.name),
    email: s(input.email).toLowerCase(),
    phone: s(input.phone),
    phoneCode: s(input.phoneCode),
    role: s(input.role),
    organization: s(input.organization),
    country: s(input.country),
    session: s(input.session),
  }
  const sessions = (course.sessions ?? []).map((x) => x.label)
  const errors: Partial<Record<keyof RegisterInput, string>> = {}
  if (!v.name) errors.name = 'Enter your full name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) errors.email = 'Enter a full email address, for example name@hospital.org'
  if (v.phone.replace(/\D/g, '').length < 6) errors.phone = 'Enter your phone number with the country code'
  if (!v.role) errors.role = 'Enter your job title or role'
  if (!v.organization) errors.organization = 'Enter your organization or hospital name'
  if (!COUNTRIES.includes(v.country)) errors.country = 'Select your country'
  if (sessions.length && !sessions.includes(v.session)) errors.session = 'Choose a session or preferred date'
  if (Object.keys(errors).length) return { ok: false, errors }

  const member = await getCurrentMember()
  await payload.create({
    collection: 'course-registrations',
    data: {
      name: v.name,
      email: v.email,
      phone: `${v.phoneCode} ${v.phone}`.trim(),
      role: v.role,
      organization: v.organization,
      country: v.country,
      session: v.session || undefined,
      joinNetwork: !!input.joinNetwork,
      course: course.id,
      member: member ? (member.id as number) : undefined,
    },
  })
  const emailed = await sendRegistrationEmail({ to: v.email, name: v.name, course: course.title, session: v.session }).catch(() => false)
  return { ok: true, emailed, session: v.session }
}
