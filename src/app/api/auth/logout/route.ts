import { NextResponse, type NextRequest } from 'next/server'

import { getCurrentMember, revokeMemberSessions, SESSION_COOKIE } from '@/lib/auth/session'

// Clears the member session and goes home. GET so plain links (Header, member nav) work.
async function logout(req: NextRequest) {
  const member = await getCurrentMember()
  if (member) await revokeMemberSessions(member.id)
  const res = NextResponse.redirect(new URL('/', req.url), 303)
  res.cookies.delete({ name: SESSION_COOKIE, path: '/' })
  return res
}

export const GET = logout
export const POST = logout
