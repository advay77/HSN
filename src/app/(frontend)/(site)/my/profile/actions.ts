'use server'

import { revalidatePath } from 'next/cache'

import { isEmail, normalizeEmail } from '@/lib/auth/codes'
import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'

export type ProfileState = { saved?: boolean; error?: string; field?: string }

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? '').trim().slice(0, max)

export async function saveProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const member = await getCurrentMember()
  if (!member) return { error: 'Your session has ended. Please log in again.' }

  const name = clean(form.get('name'))
  const email = normalizeEmail(clean(form.get('email')))
  if (!name) return { error: 'Enter your full name.', field: 'name' }
  if (!isEmail(email)) return { error: 'Enter a valid email address.', field: 'email' }

  // Changing the login email without proving the new address would let someone take over another person's
  // sign-ins (email codes and Google both match by email), so it is fixed here; HSN can change it on request.
  if (email !== member.email) return { error: 'To change your login email, contact HSN.', field: 'email' }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'members',
    id: member.id,
    data: {
      name,
      phoneCountryCode: clean(form.get('phoneCountryCode'), 20),
      phone: clean(form.get('phone'), 40),
      role: clean(form.get('role')),
      organization: clean(form.get('organization')),
      country: clean(form.get('country'), 60),
    },
  })
  revalidatePath('/', 'layout')
  return { saved: true }
}
