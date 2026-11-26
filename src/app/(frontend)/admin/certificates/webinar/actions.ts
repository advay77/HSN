'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import { formatCertificateNo, type WebinarRole } from '@/lib/certificates/webinar'

export type WebinarFormState = { error?: string; existing?: { id: number; number: string } }

const clean = (value: FormDataEntryValue | null, max = 240) => String(value ?? '').trim().slice(0, max)
// "Dr. Maher  El Masri" and "dr maher el masri" are the same person: compare letters and digits only.
const same = (a: string, b: string) => a.toLowerCase().replace(/[^a-z0-9]+/g, '') === b.toLowerCase().replace(/[^a-z0-9]+/g, '')

export async function issueWebinarCertificate(_prev: WebinarFormState, formData: FormData): Promise<WebinarFormState> {
  await requireAdmin('/admin/certificates/webinar')
  const role = formData.get('role') === 'speaker' ? 'speaker' : formData.get('role') === 'moderator' ? 'moderator' : ''
  const recipient = clean(formData.get('recipient'), 160)
  const webinar = clean(formData.get('webinar'), 240)
  const heldOn = clean(formData.get('heldOn'), 80)
  const rightName = clean(formData.get('rightName'), 120) || 'Dr. Nishant Jaiswal'
  const rightTitle = clean(formData.get('rightTitle'), 120) || 'Founder'
  if (!role || !recipient || !webinar || !heldOn) {
    return { error: 'Fill in the person’s name, the webinar, and the date.' }
  }
  const payload = await getPayloadClient()

  // One certificate per person, role and webinar: a second click must not use up a new number.
  const issued = await payload.find({ collection: 'webinar-certificates', where: { role: { equals: role } }, sort: 'certificateNo', limit: 1000, depth: 0 })
  const twin = issued.docs.find((d) => same(d.recipient, recipient) && same(d.webinar, webinar))
  if (twin) {
    const number = twin.certificateNo ? formatCertificateNo(twin.certificateNo, twin.heldOn) : 'without a number'
    return {
      error: `${twin.recipient} already has a ${role} certificate for this webinar (${number}). Open it to download it again. No new number was used.`,
      existing: { id: twin.id, number },
    }
  }

  const doc = await payload.create({
    collection: 'webinar-certificates',
    data: { role: role as WebinarRole, recipient, webinar, heldOn, rightName, rightTitle },
  })
  redirect(`/admin/certificates/webinar/${doc.id}`)
}

/** Removes a webinar certificate issued by mistake (e.g. a duplicate). If it had the highest number, that number is used again next. */
export async function deleteWebinarCertificate(id: number): Promise<{ error?: string }> {
  await requireAdmin('/admin/certificates')
  if (!Number.isInteger(id)) return { error: 'Certificate not found.' }
  const payload = await getPayloadClient()
  try {
    await payload.delete({ collection: 'webinar-certificates', id })
  } catch {
    return { error: 'The certificate could not be deleted. Refresh the page and try again.' }
  }
  revalidatePath('/admin/certificates')
  redirect('/admin/certificates')
}
