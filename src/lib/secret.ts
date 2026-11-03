import 'server-only'

// PAYLOAD_SECRET signs every session cookie and login code. Refuse to run with a missing or weak one,
// so a misconfigured server can never accept forged sessions.
export function serverSecret(): string {
  const s = process.env.PAYLOAD_SECRET || ''
  if (s.length < 32) throw new Error('PAYLOAD_SECRET must be set to a random value of at least 32 characters.')
  return s
}

export const secretKey = (purpose: 'member' | 'admin') => new TextEncoder().encode(`${purpose}:${serverSecret()}`)
