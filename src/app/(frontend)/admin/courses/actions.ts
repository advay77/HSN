'use server'

import { revalidatePath } from 'next/cache'

import type { EditorCourse } from '@/components/admin/courseTypes'
import { requireAdmin } from '@/lib/admin/auth'
import { PURPOSE_LIMITS, readUpload } from '@/lib/uploads/server'
import { fromEditor, getCourseForEditor, updatedLabel } from '@/lib/admin/courses'
import { parsePptx, type ImportResult } from '@/lib/admin/pptx'
import { getPayloadClient } from '@/lib/payload'
import { toSlug } from '@/collections/fields/slug'

type Fail = { ok: false; error: string }

export type SaveResult = { ok: true; course: EditorCourse; updated: string } | Fail

const refresh = (slug?: string | null) => {
  revalidatePath('/admin/courses')
  revalidatePath('/courses')
  if (slug) revalidatePath(`/courses/${slug}`)
}

export async function saveCourseAction(input: EditorCourse): Promise<SaveResult> {
  await requireAdmin('/admin/courses')
  const data = fromEditor(input)
  if (!data.title) return { ok: false, error: 'Add a course title (Basics tab).' }
  if (!data.description) return { ok: false, error: 'Add a short description (Basics tab).' }

  const payload = await getPayloadClient()
  const slug = toSlug(data.slug || data.title)
  if (!slug) return { ok: false, error: 'Add a web address for the course (Publishing tab).' }
  const clash = await payload.find({
    collection: 'courses',
    where: { and: [{ slug: { equals: slug } }, ...(input.id ? [{ id: { not_equals: input.id } }] : [])] },
    limit: 1,
    depth: 0,
  })
  if (clash.docs.length) return { ok: false, error: `Another course already uses the web address “${slug}”. Choose a different one (Publishing tab).` }

  try {
    const saved = input.id
      ? await payload.update({ collection: 'courses', id: input.id, data: { ...data, slug } })
      : await payload.create({ collection: 'courses', data: { ...data, slug } })
    refresh(saved.slug)
    const course = await getCourseForEditor(saved.id)
    if (!course) return { ok: false, error: 'The course was saved but could not be reloaded. Refresh the page.' }
    return { ok: true, course, updated: updatedLabel(saved.updatedAt) }
  } catch (err) {
    payload.logger.error({ err }, 'Could not save course')
    return { ok: false, error: 'The course could not be saved. Check the required fields and try again.' }
  }
}

export async function deleteCourseAction(id: number): Promise<{ ok: true } | Fail> {
  await requireAdmin('/admin/courses')
  const payload = await getPayloadClient()
  const course = await payload.findByID({ collection: 'courses', id, depth: 0 }).catch(() => null)
  if (!course) return { ok: false, error: 'This course no longer exists.' }
  // Progress records belong to the course; registrations are kept (they record what people asked for).
  await payload.delete({ collection: 'enrollments', where: { course: { equals: id } } })
  await payload.update({ collection: 'course-registrations', where: { course: { equals: id } }, data: { course: null } })
  await payload.delete({ collection: 'courses', id })
  refresh(course.slug)
  return { ok: true }
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE = 10 * 1024 * 1024

async function storeImage(buf: Buffer, name: string, mime: string, alt: string) {
  if (!IMAGE_TYPES.includes(mime)) return { ok: false as const, error: 'Use a JPG, PNG, WebP or GIF image.' }
  if (buf.length > MAX_IMAGE) return { ok: false as const, error: 'Images must be 10 MB or smaller.' }
  const payload = await getPayloadClient()
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data: buf, mimetype: mime, name, size: buf.length },
  })
  return { ok: true as const, image: { id: doc.id, url: doc.url || '', name: doc.filename || name } }
}

const TUTORIAL_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
}
const TUTORIAL_EXT = new Set(Object.keys(TUTORIAL_MIME))
const tutorialExt = (name: string) => name.split('.').pop()?.toLowerCase() || ''

function tutorialMime(name: string, type: string) {
  const ext = tutorialExt(name)
  if (!TUTORIAL_EXT.has(ext)) return null
  if (type && type !== 'application/octet-stream' && Object.values(TUTORIAL_MIME).includes(type)) return type
  return TUTORIAL_MIME[ext]!
}

/** Word, PDF, and similar files added as a tutorial lesson. */
export async function uploadTutorialAction(form: FormData) {
  await requireAdmin('/admin/courses')
  let file
  try {
    file = await readUpload(form.get('file'), PURPOSE_LIMITS.admin)
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'The file could not be uploaded.' }
  }
  if (!file) return { ok: false as const, error: 'Choose a tutorial file.' }
  const mime = tutorialMime(file.name, file.type)
  if (!mime) return { ok: false as const, error: 'Use a Word document, PDF, or a similar file (PDF, DOC, DOCX, ODT, RTF, TXT, PPT, XLS, CSV).' }
  if (file.size > PURPOSE_LIMITS.admin) return { ok: false as const, error: 'The file is larger than 30 MB.' }
  const payload = await getPayloadClient()
  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: String(form.get('alt') || file.name) },
      file: { data: file.data, mimetype: mime, name: file.name, size: file.size },
    })
    return { ok: true as const, file: { id: doc.id, url: doc.url || '', name: doc.filename || file.name } }
  } catch (err) {
    payload.logger.error({ err }, 'Could not store tutorial file')
    return { ok: false as const, error: 'The file could not be saved. Try a Word document, PDF, or a similar file.' }
  }
}

const VIDEO_MIME: Record<string, string> = { mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }

/** A video file for a video lesson (MP4, WebM or MOV, up to 50 MB). */
export async function uploadVideoAction(form: FormData) {
  await requireAdmin('/admin/courses')
  let file
  try {
    file = await readUpload(form.get('file'), PURPOSE_LIMITS['admin-video'])
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'The video could not be uploaded.' }
  }
  if (!file) return { ok: false as const, error: 'Choose a video file.' }
  const mime = VIDEO_MIME[file.name.split('.').pop()?.toLowerCase() || '']
  if (!mime) return { ok: false as const, error: 'Use an MP4 video (WebM and MOV also work).' }
  const payload = await getPayloadClient()
  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: String(form.get('alt') || file.name) },
      file: { data: file.data, mimetype: mime, name: file.name, size: file.size },
    })
    return { ok: true as const, file: { id: doc.id, url: doc.url || '', name: doc.filename || file.name } }
  } catch (err) {
    payload.logger.error({ err }, 'Could not store video file')
    return { ok: false as const, error: 'The video could not be saved. Try an MP4 file.' }
  }
}

/** Cover image or slide image chosen in the editor. */
export async function uploadImageAction(form: FormData) {
  await requireAdmin('/admin/courses')
  let file
  try {
    file = await readUpload(form.get('file'), PURPOSE_LIMITS.admin)
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'The image could not be uploaded.' }
  }
  if (!file) return { ok: false as const, error: 'Choose an image file.' }
  return storeImage(file.data, file.name, file.type, String(form.get('alt') || ''))
}

/** Diagram pictures found in an imported PowerPoint (sent back from the import preview). */
export async function uploadImportedImageAction(img: { name: string; mime: string; data: string; alt: string }) {
  await requireAdmin('/admin/courses')
  return storeImage(Buffer.from(img.data, 'base64'), img.name, img.mime, img.alt)
}

export async function importPptxAction(form: FormData): Promise<{ ok: true; result: ImportResult } | Fail> {
  await requireAdmin('/admin/courses')
  let file
  try {
    file = await readUpload(form.get('file'), 30 * 1024 * 1024)
  } catch {
    return { ok: false, error: 'The file is larger than 30 MB. Compress the pictures in PowerPoint and try again.' }
  }
  if (!file) return { ok: false, error: 'Choose a .pptx file.' }
  if (!/\.pptx$/i.test(file.name)) return { ok: false, error: 'Only PowerPoint .pptx files can be imported. Save older .ppt files as .pptx first.' }
  if (file.size > 30 * 1024 * 1024) return { ok: false, error: 'The file is larger than 30 MB. Compress the pictures in PowerPoint and try again.' }
  try {
    const result = await parsePptx(file.data, file.name)
    if (!result.slides) return { ok: false, error: 'No slides were found in this file.' }
    return { ok: true, result }
  } catch (err) {
    console.error('[pptx] import failed', err)
    return { ok: false, error: 'This file could not be read as a PowerPoint presentation.' }
  }
}
