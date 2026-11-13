'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

// Admin → Our Team: add, edit, reorder, hide or delete team members. Photos are uploaded with the shared
// image upload (Media) first; the member then points at that image.

export type TeamInput = {
  id: number | null
  name: string
  role: string
  bio: string
  photoId: number | null
  published: boolean
}

type Result = { ok: true; id: number } | { ok: false; error: string }

const refresh = () => {
  revalidatePath('/founder')
  revalidatePath('/admin/team')
}

const clean = (s: string, max = 20000) => (s ?? '').trim().slice(0, max)

export async function saveTeamMemberAction(input: TeamInput): Promise<Result> {
  await requireAdmin('/admin/team')
  const name = clean(input.name, 200)
  if (!name) return { ok: false, error: 'Enter the person’s name.' }
  const payload = await getPayloadClient()
  const data = {
    name,
    role: clean(input.role, 300),
    bio: clean(input.bio).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n'),
    photo: input.photoId ?? null,
    published: !!input.published,
  }
  try {
    if (input.id) {
      const doc = await payload.update({ collection: 'team-members', id: input.id, data })
      refresh()
      return { ok: true, id: doc.id }
    }
    const last = await payload.find({ collection: 'team-members', sort: '-sort', limit: 1, depth: 0 })
    const doc = await payload.create({ collection: 'team-members', data: { ...data, sort: (last.docs[0]?.sort ?? 0) + 1 } })
    refresh()
    return { ok: true, id: doc.id }
  } catch {
    return { ok: false, error: 'This team member could not be saved. Please try again.' }
  }
}

export async function deleteTeamMemberAction(id: number): Promise<Result> {
  await requireAdmin('/admin/team')
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'team-members', id })
  refresh()
  return { ok: true, id }
}

/** Moves a team member one place up or down the page. */
export async function moveTeamMemberAction(id: number, dir: -1 | 1): Promise<Result> {
  await requireAdmin('/admin/team')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'team-members', sort: 'sort', pagination: false, depth: 0 })
  const i = docs.findIndex((d) => d.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= docs.length) return { ok: true, id }
  const order = docs.map((d) => d.id)
  ;[order[i], order[j]] = [order[j]!, order[i]!]
  await Promise.all(order.map((docId, n) => payload.update({ collection: 'team-members', id: docId, data: { sort: n + 1 }, depth: 0 })))
  refresh()
  return { ok: true, id }
}
