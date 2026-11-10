import 'server-only'

import { quizResults, type QuizResult } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'
import type { Course, Member } from '@/payload-types'

// Quiz results for the admin panel, like the summary of a Google Form: for every quiz, how many learners took it,
// how many passed, the average score, how often each question was answered right, and each learner's result.

export type QuestionStat = {
  n: number
  text: string
  options: { text: string; correct: boolean; picked: number }[]
  /** Learners whose answers were saved (answers are kept from 11 Nov 2026 on). */
  answered: number
  right: number
}

export type LearnerRow = { name: string; email: string; score: number; total: number; passed: boolean; attempts: number; at: string; answers: number[] | null }

export type QuizStat = {
  key: string
  module: string
  title: string
  questions: number
  takers: number
  passed: number
  avgScore: number | null
  questionStats: QuestionStat[]
  learners: LearnerRow[]
}

export type CourseQuizzes = { id: number; title: string; quizzes: QuizStat[] }

const person = (v: number | Member | null | undefined) => (v && typeof v === 'object' ? v : null)

export async function listQuizResults(): Promise<CourseQuizzes[]> {
  const payload = await getPayloadClient()
  const [courses, enrollments] = await Promise.all([
    payload.find({ collection: 'courses', pagination: false, depth: 0, sort: 'title' }),
    payload.find({ collection: 'enrollments', pagination: false, depth: 1, sort: '-updatedAt' }),
  ])

  return courses.docs.map((course: Course): CourseQuizzes => {
    const mine = enrollments.docs.filter((e) => (typeof e.course === 'object' ? e.course?.id : e.course) === course.id)
    const quizzes: QuizStat[] = []
    for (const [mi, m] of (course.modules ?? []).entries()) {
      for (const l of m.lessons ?? []) {
        if (l.type !== 'quiz' || !l.id) continue
        const qs = l.questions ?? []
        const learners: LearnerRow[] = []
        for (const e of mine) {
          const r: QuizResult | undefined = quizResults(e)[l.id]
          if (!r) continue
          const who = person(e.member)
          learners.push({
            name: who?.name || 'Former member',
            email: who?.email || '',
            score: r.score,
            total: r.total,
            passed: r.passed,
            attempts: r.attempts ?? 1,
            at: r.at,
            answers: Array.isArray(r.answers) ? r.answers : null,
          })
        }
        const withAnswers = learners.filter((x) => x.answers)
        const questionStats: QuestionStat[] = qs.map((q, qi) => {
          const options = (q.options ?? []).map((o, oi) => ({ text: o.text, correct: !!o.correct, picked: withAnswers.filter((x) => x.answers![qi] === oi).length }))
          const correctIdx = options.findIndex((o) => o.correct)
          return {
            n: qi + 1,
            text: q.question,
            options,
            answered: withAnswers.filter((x) => (x.answers![qi] ?? -1) >= 0).length,
            right: withAnswers.filter((x) => x.answers![qi] === correctIdx).length,
          }
        })
        quizzes.push({
          key: l.id,
          module: `Module ${mi + 1}: ${m.title}`,
          title: l.title,
          questions: qs.length,
          takers: learners.length,
          passed: learners.filter((x) => x.passed).length,
          avgScore: learners.length ? learners.reduce((a, x) => a + x.score, 0) / learners.length : null,
          questionStats,
          learners: learners.sort((a, b) => (a.at < b.at ? 1 : -1)),
        })
      }
    }
    return { id: course.id, title: course.title, quizzes }
  })
}
