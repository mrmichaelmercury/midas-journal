import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_COOKIE = 'admin_auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/api/extension',
    '/api/live-stats',
  ]
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Admin password gate — independent of NextAuth.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // The login endpoint must be reachable without a cookie.
    if (pathname === '/api/admin/auth') return NextResponse.next()

    const expected = process.env.ADMIN_PASSWORD
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value
    const authed = !!expected && cookie === expected

    if (authed) return NextResponse.next()

    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // /admin renders its own password form when unauthed — let it through.
    return NextResponse.next()
  }

  // Everything else stays on NextAuth.
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (token.isActive === false) {
    const url = request.nextUrl.clone()
    url.pathname = '/deactivated'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
