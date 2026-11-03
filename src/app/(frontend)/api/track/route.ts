import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'

// Page-view beacon from PageTracker. "enter" only marks the member as online; "leave" stores the visit
// with the time spent, which feeds "Most viewed sections" on the admin Overview.
const SECTIONS: [string, string][] = [
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/courses', 'Courses'],
  ['/case-studies', 'Case Studies'],
  ['/library', 'Library'],
  ['/get-involved', 'Get Involved'],
  ['/membership', 'Membership'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/my', 'My HSN'],
  ['/register', 'Courses'],
  ['/login', 'Log in'],
  ['/ar', 'Arabic'],
]

const sectionOf = (path: string) =>
  path === '/' ? 'Home' : SECTIONS.find(([p]) => path === p || path.startsWith(p + '/'))?.[1] ?? null

export async function POST(req: Request) {
  if (!(await rateLimit('track', 120, 60))) return new NextResponse(null, { status: 429 })
  let body: { path?: string; seconds?: number; phase?: string }
  try {
    body = JSON.parse(await req.text())
  } catch {
    return new NextResponse(null, { status: 400 })
  }
  const path = String(body.path || '').split('?')[0]!.slice(0, 200)
  const section = sectionOf(path)
  if (!section) return new NextResponse(null, { status: 204 })

  const payload = await getPayloadClient()
  const member = await getCurrentMember()
  if (member) {
    await payload.update({ collection: 'members', id: member.id, data: { lastSeenAt: new Date().toISOString() } }).catch(() => {})
  }
  const jar = await cookies()
  let visitor = jar.get('hsn_v')?.value
  if (!visitor) {
    visitor = crypto.randomUUID()
    jar.set('hsn_v', visitor, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 })
  }
  const seconds = Math.max(0, Math.min(Math.round(Number(body.seconds) || 0), 60 * 60))
  // Views under a second are not real visits (and React's dev mode mounts pages twice), so they aren't stored.
  if (body.phase === 'leave' && seconds > 0) {
    await payload
      .create({ collection: 'page-views', data: { section, path, seconds, member: member ? Number(member.id) : undefined, visitor } })
      .catch(() => {})
  }
  return new NextResponse(null, { status: 204 })
}
