'use server'

import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import type { WebinarRole } from '@/lib/certificates/webinar'

export type WebinarFormState = { error?: string }

const clean = (value: FormDataEntryValue | null, max = 240) => String(value ?? '').trim().slice(0, max)

export async function issueWebinarCertificate(_prev: WebinarFormState, formData: FormData): Promise<WebinarFormState> {
  await requireAdmin('/admin/certificates/webinar')
  const role = formData.get('role') === 'speaker' ? 'speaker' : formData.get('role') === 'moderator' ? 'moderator' : ''
  const recipient = clean(formData.get('recipient'), 160)
  const webinar = clean(formData.get('webinar'), 240)
  const heldOn = clean(formData.get('heldOn'), 80)
  const leftName = clean(formData.get('leftName'), 120)
  const leftTitle = clean(formData.get('leftTitle'), 120)
  const rightName = clean(formData.get('rightName'), 120)
  const rightTitle = clean(formData.get('rightTitle'), 120)
  if (!role || !recipient || !webinar || !heldOn || !leftName || !leftTitle || !rightName || !rightTitle) {
    return { error: 'Fill in every field, including both people who sign the certificate.' }
  }
  const payload = await getPayloadClient()
  const doc = await payload.create({
    collection: 'webinar-certificates',
    data: { role: role as WebinarRole, recipient, webinar, heldOn, leftName, leftTitle, rightName, rightTitle },
  })
  redirect(`/admin/certificates/webinar/${doc.id}`)
}
