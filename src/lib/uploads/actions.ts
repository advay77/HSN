'use server'

import { getAdmin } from '@/lib/admin/auth'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'

import { directUploadsEnabled, PURPOSE_LIMITS, signUpload, sweepIncoming, type UploadPurpose } from './server'

export type StartUpload = { mode: 'form' } | { mode: 'direct'; url: string; path: string } | { mode: 'error'; error: string }

const PUBLIC_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

// Called by the browser before sending a file. Returns where to send it (see ./server.ts).
export async function startUpload(input: { name: string; type: string; size: number; purpose: UploadPurpose }): Promise<StartUpload> {
  if (!directUploadsEnabled()) return { mode: 'form' }
  const purpose: UploadPurpose = input.purpose === 'admin' ? 'admin' : 'case-attachment'
  if (purpose === 'admin') {
    if (!(await getAdmin())) return { mode: 'error', error: 'Please log in to the admin panel again.' }
  } else {
    if (!(await rateLimit('upload-public', 20, 60 * 60))) return { mode: 'error', error: TOO_MANY }
    if (!PUBLIC_TYPES.includes(input.type)) return { mode: 'error', error: 'Attach PDF, JPG or PNG files only.' }
  }
  if (!(input.size > 0) || input.size > PURPOSE_LIMITS[purpose]) {
    return { mode: 'error', error: `Each file must be ${Math.round(PURPOSE_LIMITS[purpose] / 1048576)} MB or smaller.` }
  }
  try {
    const { url, path } = await signUpload(String(input.name || 'file'))
    void sweepIncoming()
    return { mode: 'direct', url, path }
  } catch (e) {
    console.error('[upload] could not sign upload', e)
    return { mode: 'error', error: 'The file could not be uploaded just now. Please try again.' }
  }
}
