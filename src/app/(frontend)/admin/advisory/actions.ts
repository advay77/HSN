'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

// Admin → Advisory Board: add, edit, reorder, hide or delete advisors. Photos are uploaded with the shared
// image upload (Media) first; the advisor then points at that image.

export type AdvisorInput = {
  id: number | null
  name: string
  role: string
  badge: string
  bio: string
  photoId: number | null
  /** Keep the photo that ships with the website (first advisors) unless a new one is uploaded or it is removed. */
  keepPhotoPath: boolean
  published: boolean
}

type Result = { ok: true; id: number } | { ok: false; error: string }

const refresh = () => {
  revalidatePath('/advisory')
  revalidatePath('/admin/advisory')
}

const clean = (s: string, max = 20000) => (s ?? '').trim().slice(0, max)

export async function saveAdvisorAction(input: AdvisorInput): Promise<Result> {
  await requireAdmin('/admin/advisory')
  const name = clean(input.name, 200)
  if (!name) return { ok: false, error: 'Enter the advisor’s name.' }
  const payload = await getPayloadClient()
  const data = {
    name,
    role: clean(input.role, 300),
    badge: clean(input.badge, 60) || 'Advisor',
    // Paragraphs: keep blank lines between them, tidy everything else.
    bio: clean(input.bio).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n'),
    photo: input.photoId ?? null,
    ...(input.photoId || !input.keepPhotoPath ? { photoPath: null } : {}),
    published: !!input.published,
  }
  try {
    if (input.id) {
      const doc = await payload.update({ collection: 'advisors', id: input.id, data })
      refresh()
      return { ok: true, id: doc.id }
    }
    const last = await payload.find({ collection: 'advisors', sort: '-sort', limit: 1, depth: 0 })
    const doc = await payload.create({ collection: 'advisors', data: { ...data, sort: (last.docs[0]?.sort ?? 0) + 1 } })
    refresh()
    return { ok: true, id: doc.id }
  } catch {
    return { ok: false, error: 'The advisor could not be saved. Please try again.' }
  }
}

export async function deleteAdvisorAction(id: number): Promise<Result> {
  await requireAdmin('/admin/advisory')
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'advisors', id })
  refresh()
  return { ok: true, id }
}

/** Moves an advisor one place up or down the page. */
export async function moveAdvisorAction(id: number, dir: -1 | 1): Promise<Result> {
  await requireAdmin('/admin/advisory')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'advisors', sort: 'sort', pagination: false, depth: 0 })
  const i = docs.findIndex((d) => d.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= docs.length) return { ok: true, id }
  const order = docs.map((d) => d.id)
  ;[order[i], order[j]] = [order[j]!, order[i]!]
  // Renumber 1, 2, 3… so the order is always clear.
  await Promise.all(order.map((docId, n) => payload.update({ collection: 'advisors', id: docId, data: { sort: n + 1 }, depth: 0 })))
  refresh()
  return { ok: true, id }
}
