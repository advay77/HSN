import 'server-only'

import { getPayloadClient } from '@/lib/payload'
import { PURPOSE_LIMITS, readUpload } from '@/lib/uploads/server'

// Saves a file from an admin form (a File, or "incoming:<path>" uploaded straight to storage) to the
// `media` collection and returns its id, or null when no file was chosen.
export async function uploadToMedia(entry: FormDataEntryValue | null, alt?: string): Promise<number | null> {
  const file = await readUpload(entry, PURPOSE_LIMITS.admin)
  if (!file) return null
  const payload = await getPayloadClient()
  const doc = await payload.create({
    collection: 'media',
    data: { alt: alt || file.name.replace(/\.[^.]+$/, '') },
    file: { data: file.data, mimetype: file.type, name: file.name, size: file.size },
  })
  return Number(doc.id)
}
