import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const COOKIE_NAME = 'auth-token'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  // For API routes
  if (pathname.startsWith('/api/')) {
    // Public auth routes allowed
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
      return NextResponse.next()
    }
    
    // Public data routes allowed (for public browsing)
    if (pathname.startsWith('/api/schools') || pathname.startsWith('/api/majors') || pathname.startsWith('/api/transfer-guides')) {
      return NextResponse.next()
    }
    
    // Protected API routes
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protected page routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/leads') || pathname.startsWith('/analytics')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/analytics/:path*', '/api/:path*'],
}
