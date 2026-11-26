'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { youtubeId } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'

// Admin → Webinars: add, edit, hide or delete the webinars shown on /webinars. Photos and videos are uploaded
// first with the shared upload actions (Media); the webinar then points at them.

export type SpeakerInput = { name: string; role: string; label: string; photoId: number | null }
export type WebinarInput = {
  id: number | null
  title: string
  /** YYYY-MM-DD from the date picker. */
  date: string
  time: string
  summary: string
  youtubeUrl: string
  videoId: number | null
  speakers: SpeakerInput[]
  published: boolean
}

type Result = { ok: true; id: number } | { ok: false; error: string }

const clean = (s: string, max = 20000) => (s ?? '').trim().slice(0, max)
const refresh = () => {
  revalidatePath('/webinars')
  revalidatePath('/admin/webinars')
}

export async function saveWebinarAction(input: WebinarInput): Promise<Result> {
  await requireAdmin('/admin/webinars')
  const title = clean(input.title, 300)
  if (!title) return { ok: false, error: 'Enter the webinar title.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '')) return { ok: false, error: 'Choose the webinar date.' }
  const youtubeUrl = clean(input.youtubeUrl, 500)
  if (youtubeUrl && !youtubeId(youtubeUrl)) return { ok: false, error: 'That YouTube link doesn’t look right. Copy the link from the video’s Share button.' }
  const speakers = (input.speakers || [])
    .map((s) => ({ name: clean(s.name, 200), role: clean(s.role, 300), label: clean(s.label, 60) || 'Speaker', photo: s.photoId ?? null }))
    .filter((s) => s.name || s.role || s.photo)
  if (speakers.some((s) => !s.name)) return { ok: false, error: 'Each speaker needs a name. Remove empty speakers or add their name.' }
  const data = {
    title,
    // Stored at midnight UTC and always shown from the YYYY-MM-DD part, so the date never shifts by time zone.
    heldOn: `${input.date}T00:00:00.000Z`,
    time: clean(input.time, 100),
    summary: clean(input.summary).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n'),
    youtubeUrl,
    video: input.videoId ?? null,
    speakers,
    published: !!input.published,
  }
  const payload = await getPayloadClient()
  try {
    const doc = input.id
      ? await payload.update({ collection: 'webinars', id: input.id, data })
      : await payload.create({ collection: 'webinars', data })
    refresh()
    return { ok: true, id: doc.id }
  } catch (err) {
    payload.logger.error({ err }, 'Could not save webinar')
    return { ok: false, error: 'The webinar could not be saved. Please try again.' }
  }
}

export async function deleteWebinarAction(id: number): Promise<Result> {
  await requireAdmin('/admin/webinars')
  if (!Number.isInteger(id)) return { ok: false, error: 'Webinar not found.' }
  const payload = await getPayloadClient()
  try {
    await payload.delete({ collection: 'webinars', id })
  } catch {
    return { ok: false, error: 'The webinar could not be deleted. Refresh the page and try again.' }
  }
  refresh()
  return { ok: true, id }
}
