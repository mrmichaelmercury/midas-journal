import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = request.nextUrl

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/signup', '/api/auth']
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  // Not authenticated
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Account deactivated
  if (token.isActive === false) {
    // Sign them out by redirecting to a deactivated page
    const url = request.nextUrl.clone()
    url.pathname = '/deactivated'
    return NextResponse.redirect(url)
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (token.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
