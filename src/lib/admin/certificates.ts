import 'server-only'

import { certificateId } from '@/lib/courses/certificate'
import { getPayloadClient } from '@/lib/payload'
import type { Course, Member } from '@/payload-types'

export type CompletionRow = {
  enrollmentId: number
  name: string
  email: string
  course: string
  when: string
  generated: boolean
  certificateId: string | null
}

const person = (value: number | Member | null | undefined) => (value && typeof value === 'object' ? value : null)
const courseOf = (value: number | Course | null | undefined) => (value && typeof value === 'object' ? value : null)

/** Everyone who has finished a course, and whether their certificate was created. */
export async function listCompletions(): Promise<{ rows: CompletionRow[]; generated: number; completed: number }> {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'enrollments',
    where: { progress: { greater_than_equal: 100 } },
    sort: '-completedAt',
    pagination: false,
    depth: 1,
  })
  const rows = found.docs.flatMap((enrollment): CompletionRow[] => {
    const member = person(enrollment.member)
    const course = courseOf(enrollment.course)
    const when = enrollment.completedAt || enrollment.updatedAt
    if (!when) return []
    const generated = (enrollment.progress ?? 0) >= 100 && !!enrollment.completedAt && !!course && course.certificate?.enabled !== false
    return [{
      enrollmentId: enrollment.id,
      name: member?.name || 'Former member',
      email: member?.email || '',
      course: course?.title || 'Course removed',
      when,
      generated,
      certificateId: generated ? certificateId(enrollment.id) : null,
    }]
  })
  return { rows, generated: rows.filter((row) => row.generated).length, completed: rows.length }
}
