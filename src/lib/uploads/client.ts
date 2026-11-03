'use client'

import { startUpload } from './actions'

type Purpose = 'case-attachment' | 'admin'

/**
 * Prepares a file for a server action. In production it is uploaded straight to storage and this returns
 * "incoming:<path>"; in development it returns the File itself. Throws with a readable message on failure.
 */
export async function toUploadable(file: File, purpose: Purpose): Promise<File | string> {
  const s = await startUpload({ name: file.name, type: file.type, size: file.size, purpose })
  if (s.mode === 'form') return file
  if (s.mode === 'error') throw new Error(s.error)
  const body = new FormData()
  body.append('cacheControl', '3600')
  body.append('', file)
  const res = await fetch(s.url, { method: 'PUT', body })
  if (!res.ok) throw new Error('The file could not be uploaded. Check your connection and try again.')
  return `incoming:${s.path}`
}
