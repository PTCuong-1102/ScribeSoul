import { createNeonAuth } from '@neondatabase/auth/next/server'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || 'http://localhost:3000/auth',
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || 'temporary-build-secret-1234567890',
  },
})
