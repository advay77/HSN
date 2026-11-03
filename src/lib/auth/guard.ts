import 'server-only'

import { redirect } from 'next/navigation'

import { getCurrentMember, type CurrentMember } from './session'

// For member-only pages: returns the member, or sends them to log in and back here afterwards.
export async function requireMember(returnTo: string): Promise<CurrentMember> {
  const member = await getCurrentMember()
  if (!member) redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  return member
}
