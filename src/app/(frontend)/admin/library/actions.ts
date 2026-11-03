'use server'

import { revalidatePath } from 'next/cache'

import { LIBRARY_TYPES } from '@/collections/LibraryResources'
import { requireAdmin } from '@/lib/admin/auth'
import { uploadToMedia } from '@/lib/admin/media'
import { getPayloadClient } from '@/lib/payload'

type LibType = (typeof LIBRARY_TYPES)[number]

export type LibraryForm = {
  title: string
  type: LibType | ''
  access: 'free' | 'members'
  description: string
  format: string
  size: string
  fileId: number | null
  externalUrl: string
  published: boolean
}
export type LibrarySave = { ok: true; id: number } | { ok: false; errors: Record<string, string> }

const refresh = () => {
  revalidatePath('/admin/library')
  revalidatePath('/library')
}
const clean = (s: unknown, max = 3000) => String(s ?? '').trim().slice(0, max)

export async function saveLibraryResource(id: number | null, formData: FormData): Promise<LibrarySave> {
  await requireAdmin(id ? `/admin/library/${id}` : '/admin/library/new')
  let f: LibraryForm
  try {
    f = JSON.parse(String(formData.get('data') || ''))
  } catch {
    return { ok: false, errors: { form: 'The form could not be read. Reload the page and try again.' } }
  }
  const file = formData.get('file')
  const hasNewFile = !!file && typeof file !== 'string' && file.size > 0
  const url = clean(f.externalUrl, 1000)
  const errors: Record<string, string> = {}
  if (!clean(f.title)) errors.title = 'Enter a title.'
  if (!LIBRARY_TYPES.includes(f.type as LibType)) errors.type = 'Choose a type.'
  if (!clean(f.description)) errors.description = 'Enter a short description.'
  if (url && !/^https?:\/\/\S+$/i.test(url)) errors.externalUrl = 'Enter a full link starting with https://'
  if (f.published && !hasNewFile && !f.fileId && !url) errors.file = 'Add a file or a link before publishing.'
  if (Object.keys(errors).length) return { ok: false, errors }

  let fileId = f.fileId
  try {
    fileId = (await uploadToMedia(file, clean(f.title))) ?? fileId
  } catch (e) {
    return { ok: false, errors: { file: e instanceof Error ? e.message : 'The file could not be uploaded.' } }
  }
  const data = {
    title: clean(f.title, 300),
    type: f.type as LibType,
    access: f.access === 'members' ? ('members' as const) : ('free' as const),
    description: clean(f.description),
    format: clean(f.format, 80) || null,
    size: clean(f.size, 80) || null,
    file: fileId,
    externalUrl: url || null,
    published: !!f.published,
  }
  const payload = await getPayloadClient()
  const oldFile = id && fileId !== f.fileId ? f.fileId : null
  try {
    const doc = id ? await payload.update({ collection: 'library-resources', id, data }) : await payload.create({ collection: 'library-resources', data })
    if (fileId) await payload.update({ collection: 'media', id: fileId, data: { private: data.access === 'members' } })
    if (oldFile) await removeFile(oldFile)
    refresh()
    return { ok: true, id: Number(doc.id) }
  } catch (e) {
    payload.logger.error({ err: e }, 'Could not save library resource')
    return { ok: false, errors: { form: 'The resource could not be saved. Please try again.' } }
  }
}

export async function setLibraryPublished(id: number, published: boolean): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin('/admin/library')
  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'library-resources', id, depth: 0 }).catch(() => null)
  if (!doc) return { ok: false, error: 'This resource no longer exists.' }
  if (published && !doc.file && !doc.externalUrl) return { ok: false, error: 'Add a file or a link before publishing.' }
  await payload.update({ collection: 'library-resources', id, data: { published } })
  refresh()
  return { ok: true }
}

// Library files are uploaded for one resource, so they go when the resource is deleted or its file is replaced.
async function removeFile(mediaId: number) {
  const payload = await getPayloadClient()
  const used = await payload.count({ collection: 'library-resources', where: { file: { equals: mediaId } } })
  if (used.totalDocs === 0) await payload.delete({ collection: 'media', id: mediaId }).catch(() => null)
}

export async function deleteLibraryResource(id: number): Promise<{ ok: boolean }> {
  await requireAdmin('/admin/library')
  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'library-resources', id, depth: 0 }).catch(() => null)
  await payload.delete({ collection: 'library-resources', id })
  if (doc?.file) await removeFile(Number(doc.file))
  refresh()
  return { ok: true }
}
