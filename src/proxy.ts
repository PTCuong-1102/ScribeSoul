import { auth } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

let authMiddleware: ((request: NextRequest) => Response | Promise<Response>) | null = null

function getAuthMiddleware() {
  if (!authMiddleware) {
    authMiddleware = auth.middleware({
      loginUrl: '/login',
    })
  }

  return authMiddleware
}

export default function proxy(request: NextRequest) {
  try {
    // Delegate to NeonAuth middleware for session validation
    return getAuthMiddleware()(request)
  } catch (error) {
    console.error('[Proxy Middleware] Error:', error)
    // On error, redirect to login for safety
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/workspace/:path*'],
}
