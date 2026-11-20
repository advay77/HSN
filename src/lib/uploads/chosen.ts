// A chosen upload is either the file itself (local) or "incoming:<path>" after a direct upload (production).
export const INCOMING_PREFIX = 'incoming:'

export function isChosenUpload(entry: FormDataEntryValue | null): boolean {
  if (!entry) return false
  if (typeof entry !== 'string') return entry.size > 0
  return entry.startsWith(INCOMING_PREFIX)
}
