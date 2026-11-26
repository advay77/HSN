// Small helpers shared by the Webinars page and its admin.

/** "2026-11-21T00:00:00.000Z" → "21 November 2026" (the date as entered, never shifted by time zone). */
export function formatWebinarDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${d} ${months.at(m - 1)} ${y}`
}

export const initialsOf = (name: string) =>
  name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
