'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

/** Shows or hides one feedback response on the course page. Only possible when the learner agreed. */
export async function setFeedbackOnSite(form: FormData) {
  const id = Number(form.get('id'))
  await requireAdmin(`/admin/feedback/${id}`)
  if (!Number.isInteger(id) || id <= 0) return
  const show = form.get('show') === '1'
  const payload = await getPayloadClient()
  const row = await payload.findByID({ collection: 'course-feedback', id, depth: 0 }).catch(() => null)
  if (!row || (show && !row.sharePublicly)) return
  await payload.update({ collection: 'course-feedback', id, data: { showOnSite: show } })
  revalidatePath(`/admin/feedback/${id}`)
}

/** Website feedback: mark read/unread, or delete (for spam). */
export async function updateSiteFeedback(form: FormData) {
  await requireAdmin('/admin/feedback')
  const id = Number(form.get('id'))
  if (!Number.isInteger(id) || id <= 0) return
  const payload = await getPayloadClient()
  const op = String(form.get('op') || '')
  if (op === 'delete') await payload.delete({ collection: 'site-feedback', id }).catch(() => null)
  else await payload.update({ collection: 'site-feedback', id, data: { read: op === 'read' } }).catch(() => null)
  revalidatePath('/admin/feedback')
}
