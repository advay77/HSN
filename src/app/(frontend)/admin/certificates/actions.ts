'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { restartCertificateNumbers } from '@/lib/courses/certificate'

/** Launch day: the next certificate issued gets number 0001. Earlier certificates keep a valid (older-style) ID. */
export async function restartNumberingAction(): Promise<void> {
  await requireAdmin('/admin/certificates')
  await restartCertificateNumbers()
  revalidatePath('/admin/certificates')
}
