import { createNeonAuth } from '@neondatabase/auth/next/server'

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production' && !process.env.NEON_AUTH_BASE_URL) {
  throw new Error('NEON_AUTH_BASE_URL is required in production. Please set it in your Vercel environment variables.')
}

if (process.env.NODE_ENV === 'production' && (!process.env.NEON_AUTH_COOKIE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET.length < 32)) {
  throw new Error('NEON_AUTH_COOKIE_SECRET must be at least 32 characters long in production.')
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
})
