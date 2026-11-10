// Lesson player (Player.dc.html). Members only: logged-out visitors are sent to log in and back.
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import { Player } from '@/components/courses/Player'
import { requireMember } from '@/lib/auth/guard'
import { completedIds, getCourseBySlug, getOrCreateEnrollment, progressOf, quizResults } from '@/lib/courses/data'
import { buildPlayerModules } from '@/lib/courses/playerData'
import { getPayloadClient } from '@/lib/payload'
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

  const modules = buildPlayerModules(course, { results })

  // The certificate opens only after the member has sent the course feedback.
  const payload = await getPayloadClient()
  const feedback = await payload.find({
    collection: 'course-feedback',
    where: { and: [{ member: { equals: member.id } }, { course: { equals: course.id } }] },
    limit: 1,
    depth: 0,
  })

  return (
    <Player
      course={{ id: course.id, slug: course.slug!, title: course.title, retakes: course.certificate?.retakes !== false, maxAttempts: course.certificate?.maxAttempts ?? 0, certificate: course.certificate?.enabled !== false, feedbackSent: feedback.docs.length > 0, finished: progressOf(course, enrollment) === 100 }}
      modules={modules}
      initialCompleted={completedIds(enrollment)}
      initialResults={results}
      startAt={startAt ?? null}
      whatsapp={SOCIAL.whatsapp}
    />
  )
}
