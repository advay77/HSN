import { NextResponse } from 'next/server'

import { clearAdminCookie } from '@/lib/admin/auth'

export async function GET(req: Request) {
  await clearAdminCookie()
  return NextResponse.redirect(new URL('/login?admin=1', req.url))
}
