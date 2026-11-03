'use server'

import { revalidatePath } from 'next/cache'

import { getAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'

type Result = { ok: true } | { ok: false; error: string }

const memberId = (id: unknown) => {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function setBlockedAction(id: number, blocked: boolean): Promise<Result> {
  if (!(await getAdmin())) return { ok: false, error: 'Please log in to the admin panel again.' }
  const mid = memberId(id)
  if (!mid) return { ok: false, error: 'Member not found.' }
  const payload = await getPayloadClient()
  await payload.update({ collection: 'members', id: mid, data: { blocked: !!blocked } })
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${mid}`)
  return { ok: true }
}

// Deletes the account with its course progress, registrations, activity and page views (as the confirm
// dialog says). Membership applications and case studies stay as records of what was submitted.
export async function removeMemberAction(id: number): Promise<Result & { name?: string }> {
  if (!(await getAdmin())) return { ok: false, error: 'Please log in to the admin panel again.' }
  const mid = memberId(id)
  if (!mid) return { ok: false, error: 'Member not found.' }
  const payload = await getPayloadClient()
  const member = await payload.findByID({ collection: 'members', id: mid, depth: 0 }).catch(() => null)
  if (!member) return { ok: false, error: 'Member not found.' }
  const byMember = { member: { equals: mid } }
  await payload.delete({ collection: 'enrollments', where: byMember })
  await payload.delete({ collection: 'course-registrations', where: byMember })
  await payload.delete({ collection: 'activity', where: byMember })
  await payload.delete({ collection: 'page-views', where: byMember })
  await payload.update({ collection: 'membership-applications', where: byMember, data: { member: null } })
  await payload.delete({ collection: 'members', id: mid })
  revalidatePath('/admin/members')
  revalidatePath('/admin')
  return { ok: true, name: member.name }
}

const TIERS = ['student', 'individual', 'institutional']
const STATUSES = ['none', 'pending', 'active', 'expired']

export async function updateMembershipAction(
  id: number,
  input: { tier: string; status: string; note: string },
): Promise<Result> {
  if (!(await getAdmin())) return { ok: false, error: 'Please log in to the admin panel again.' }
  const mid = memberId(id)
  if (!mid) return { ok: false, error: 'Member not found.' }
  const tier = TIERS.includes(input.tier) ? input.tier : null
  const status = STATUSES.includes(input.status) ? input.status : 'none'
  if (status === 'active' && !tier) return { ok: false, error: 'Choose a tier before making the membership active.' }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'members',
    id: mid,
    data: {
      membershipTier: tier as 'student' | 'individual' | 'institutional' | null,
      membershipStatus: status as 'none' | 'pending' | 'active' | 'expired',
      adminNote: String(input.note ?? '').slice(0, 4000),
    },
  })
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${mid}`)
  return { ok: true }
}
