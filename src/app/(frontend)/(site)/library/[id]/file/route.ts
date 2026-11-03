import { NextResponse, type NextRequest } from 'next/server'

import { getCurrentMember } from '@/lib/auth/session'
import { serveMediaFile } from '@/lib/media-file'
import { getPayloadClient } from '@/lib/payload'

// Opens a library resource. "Members" resources need a signed-in member with an active membership.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'library-resources', id, depth: 1 }).catch(() => null)
  if (!doc || !doc.published) return new NextResponse('Not found', { status: 404 })

  if (doc.access === 'members') {
    const member = await getCurrentMember()
    if (!member) return NextResponse.redirect(new URL('/login?next=%2Flibrary', req.url))
    if (member.membershipStatus !== 'active') return NextResponse.redirect(new URL('/membership', req.url))
  }

  const file = doc.file && typeof doc.file === 'object' ? doc.file : null
  if (file && doc.access === 'members') return serveMediaFile(file.id)
  const target = file?.url || doc.externalUrl
  if (!target) return new NextResponse('Not found', { status: 404 })
  return NextResponse.redirect(new URL(target, req.url))
}
