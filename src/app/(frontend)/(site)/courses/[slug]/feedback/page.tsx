import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/feedback.css'

import { FeedbackForm } from '@/components/courses/FeedbackForm'
import { requireMember } from '@/lib/auth/guard'
import { getCourseBySlug, getEnrollment, progressOf } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Course feedback' }

type Props = { params: Promise<{ slug: string }> }

const day = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))

export default async function CourseFeedbackPage({ params }: Props) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const member = await requireMember(`/courses/${slug}/feedback`)
  const enrollment = await getEnrollment(member.id, course.id)
  const progress = progressOf(course, enrollment)

  if (progress < 100) {
    return (
      <main>
        <section className="sec" style={{ paddingTop: '48px' }}>
          <div className="wrap" style={{ maxWidth: '760px' }}>
            <div className="card pad-l stack g16">
              <h1 className="h2">Finish the course first</h1>
              <p className="muted">The feedback form opens after you complete every lesson in {course.title}. You are {progress}% of the way there.</p>
              <a className="btn btn-p" href={`/courses/${slug}/learn`}>{progress > 0 ? 'Continue course' : 'Start course'}</a>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'course-feedback',
    where: { and: [{ member: { equals: member.id } }, { course: { equals: course.id } }] },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    return (
      <main>
        <section className="sec" style={{ paddingTop: '48px' }}>
          <div className="wrap" style={{ maxWidth: '760px' }}>
            <div className="card pad-l stack g16" role="status">
              <h1 className="h2">Feedback already sent</h1>
              <p className="muted">You have already shared feedback for {course.title}. The HSN team can read it in the admin panel.</p>
              <div className="row g12 mstack">
                <a className="btn btn-p" href={`/courses/${slug}/certificate`}>View certificate</a>
                <a className="btn btn-s" href="/my">Back to My HSN</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px' }}>
        <div className="wrap" style={{ maxWidth: '860px' }}>
          <FeedbackForm
            courseSlug={course.slug || slug}
            courseTitle={course.title}
            defaults={{ name: member.name, completionDate: day(enrollment?.completedAt) }}
          />
        </div>
      </section>
    </main>
  )
}
