const DAY = 24 * 60 * 60 * 1000

/** "Today", "Yesterday" or "20 Oct 2026", as the admin boards show dates. */
export const dayLabel = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (d.getTime() >= start) return 'Today'
  if (d.getTime() >= start - DAY) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
