import 'server-only'

import type { CaseStudy, Media } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const publishedCaseStudies = async (limit = 200) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'case-studies',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return res.docs
}

// `includeUnpublished` is only for signed-in admins previewing a submission or draft.
export const caseStudyBySlug = async (slug: string, includeUnpublished = false) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'case-studies',
    where: includeUnpublished ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export const mediaOf = (m: CaseStudy['image']): Media | null => (m && typeof m === 'object' ? m : null)

export const readingMinutes = (cs: CaseStudy) => {
  const text = [
    cs.summary,
    ...(cs.sections ?? []).flatMap((s) => [s.heading, s.lead, s.body, ...(s.bullets ?? []).map((b) => b.text)]),
    ...(cs.lessons ?? []).flatMap((l) => [l.title, l.text]),
  ]
    .filter(Boolean)
    .join(' ')
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}
