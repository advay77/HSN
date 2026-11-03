// `?next=` is only honoured for same-site relative paths, never another origin ("//evil.com", "https://...").
export function safeNext(next: unknown, fallback = '/my'): string {
  if (typeof next !== 'string' || !next) return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  // Browsers drop tabs/newlines inside URLs ("/\t/evil.com" becomes "//evil.com"), so refuse any control character or backslash.
  if (/[\x00-\x1f\x7f\\]/.test(next)) return fallback
  return next
}
