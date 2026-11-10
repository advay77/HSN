// Admin preview of a course in the real lesson player: every module open, quizzes answerable, nothing saved.
// Admins only; works for drafts and "Coming soon" courses too.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Player } from '@/components/courses/Player'
import { requireAdmin } from '@/lib/admin/auth'
import { buildPlayerModules } from '@/lib/courses/playerData'
import { getPayloadClient } from '@/lib/payload'
import { SOCIAL } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Course preview', robots: { index: false } }

type Props = { params: Promise<{ id: string }> }

export default async function AdminPreviewPage({ params }: Props) {
  const { id } = await params
  await requireAdmin(`/admin-preview/${id}`)
  const payload = await getPayloadClient()
  const course = await payload.findByID({ collection: 'courses', id: Number(id), depth: 2, overrideAccess: true }).catch(() => null)
  if (!course) notFound()

  const modules = buildPlayerModules(course, { results: {}, preview: true })
  return (
    <Player
      course={{ id: course.id, slug: course.slug || '', title: course.title, retakes: course.certificate?.retakes !== false, maxAttempts: course.certificate?.maxAttempts ?? 0, certificate: course.certificate?.enabled !== false, feedbackSent: false, finished: false }}
      modules={modules}
      initialCompleted={[]}
      initialResults={{}}
      startAt={null}
      whatsapp={SOCIAL.whatsapp}
      preview
      exitHref={`/admin/courses?edit=${course.id}`}
    />
  )
}
