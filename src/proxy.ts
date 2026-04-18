import { auth } from '@/lib/auth/server'
import { NextRequest } from 'next/server'

const authMiddleware = auth.middleware({
  loginUrl: '/login',
})

export function proxy(request: NextRequest) {
  return authMiddleware(request)
}

export const config = {
  matcher: ['/workspace/:path*'],
}
