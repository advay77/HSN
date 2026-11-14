import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get('hsnpreview') === '1' && request.cookies.get('hsn_admin')) {
    const headers = new Headers(request.headers)
    headers.set('x-hsn-preview', '1')
    return NextResponse.next({ request: { headers } })
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|api|admin|cms|images).*)'] }
