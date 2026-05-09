import { auth } from '@/lib/auth/server'
import { NextRequest } from 'next/server'

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
  return getAuthMiddleware()(request)
}

export const config = {
  matcher: ['/workspace/:path*'],
}
