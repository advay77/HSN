import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getCurrentMember } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'
import { sectionOf } from '@/lib/sections'

// Beacon from PageTracker. "enter" only marks the member as online; "leave" stores the page view with the time
// spent and where the person came from; "click" stores a link or button click. Feeds the admin analytics.
export async function POST(req: Request) {
  if (!(await rateLimit('track', 300, 60))) return new NextResponse(null, { status: 429 })
  let body: { path?: string; seconds?: number; phase?: string; from?: string; referrer?: string; label?: string; target?: string; kind?: string }
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
  const text = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
  if (body.phase === 'click') {
    const label = text(body.label, 80)
    if (label) {
      await payload
        .create({
          collection: 'click-events',
          data: { path, label, target: text(body.target, 200) || undefined, kind: body.kind === 'button' ? 'button' : 'link', member: member ? Number(member.id) : undefined, visitor },
        })
        .catch(() => {})
    }
    return new NextResponse(null, { status: 204 })
  }
  if (body.phase === 'leave' && seconds > 0) {
    await payload
      .create({ collection: 'page-views', data: { section, path, seconds, member: member ? Number(member.id) : undefined, visitor, from: text(body.from, 200).split('?')[0] || undefined, referrer: text(body.referrer, 100) || undefined } })
      .catch(() => {})
  }
  return new NextResponse(null, { status: 204 })
}
