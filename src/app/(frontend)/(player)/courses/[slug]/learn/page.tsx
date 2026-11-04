// Lesson player (Player.dc.html). Members only: logged-out visitors are sent to log in and back.
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import { Player, type PlayerLesson, type PlayerModule } from '@/components/courses/Player'
import { requireMember } from '@/lib/auth/guard'
import {
  completedIds,
  getCourseBySlug,
  getOrCreateEnrollment,
  isQuiz,
  media,
  passNeeded,
  playerKind,
  quizResults,
  visibleModules,
  youtubeId,
} from '@/lib/courses/data'
import { SOCIAL } from '@/lib/site'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lesson?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug)
  return course ? { title: course.title, robots: { index: false } } : {}
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { lesson: startAt } = await searchParams
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  if (!(course.modules ?? []).some((m) => m.status === 'available')) redirect(`/courses/${slug}`)
  const member = await requireMember(`/courses/${slug}/learn`)
  if (course.audience === 'members' && member.membershipStatus !== 'active') redirect('/membership')

  const enrollment = await getOrCreateEnrollment(member.id, course.id)
  const results = quizResults(enrollment)

  const modules: PlayerModule[] = visibleModules(course).map((m, i) => ({
    n: i + 1,
    title: m.title,
    status: m.status === 'available' ? 'available' : 'coming-soon',
    slides: (() => {
      const f = media(m.slides)
      if (!f?.url) return null
      const ext = (f.filename?.split('.').pop() || 'file').toUpperCase()
      const size = f.filesize ? ` · ${(f.filesize / 1024 / 1024).toFixed(1)} MB` : ''
      return { url: f.url, label: `${ext}${size}` }
    })(),
    lessons:
      m.status === 'available'
        ? (m.lessons ?? []).map((l): PlayerLesson => {
            const img = media(l.image)
            const passedBefore = isQuiz(l) && !!results[l.id!]?.passed
            return {
              id: l.id!,
              type: l.type,
              title: l.title,
              kind: playerKind(l),
              body: l.body ?? '',
              extra: l.extra ?? '',
              image: img?.url ? { url: img.url, alt: img.alt || '' } : null,
              youtube: youtubeId(l.youtubeId),
              references: (l.references ?? []).map((r) => ({ text: r.text, url: r.url ?? '', linkText: r.linkText ?? '' })),
              draft: !!l.draftQuestions,
              // Correct answers are only sent for quizzes the member has already passed.
              questions: (l.questions ?? []).map((q) => ({
                q: q.question,
                o: (q.options ?? []).map((o) => o.text),
                a: passedBefore ? Math.max(0, (q.options ?? []).findIndex((o) => o.correct)) : null,
              })),
              need: isQuiz(l) ? passNeeded(course, l.questions?.length ?? 0) : 0,
            }
          })
        : [],
  }))

  return (
    <Player
      course={{ id: course.id, slug: course.slug!, title: course.title, retakes: course.certificate?.retakes !== false, maxAttempts: course.certificate?.maxAttempts ?? 0, certificate: course.certificate?.enabled !== false }}
      modules={modules}
      initialCompleted={completedIds(enrollment)}
      initialResults={results}
      startAt={startAt ?? null}
      whatsapp={SOCIAL.whatsapp}
    />
  )
}
