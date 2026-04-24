import { createNeonAuth } from '@neondatabase/auth/next/server'

type NeonAuth = ReturnType<typeof createNeonAuth>

let _auth: NeonAuth | null = null

function getAuth(): NeonAuth {
  if (_auth) return _auth

  // During build or when env vars are missing, create with placeholder values.
  // The actual endpoints will never be reached at build time.
  const baseUrl = process.env.NEON_AUTH_BASE_URL || 'http://localhost:3000/auth'
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || 'build-time-placeholder-secret-32chars!'

  _auth = createNeonAuth({
    baseUrl,
    cookies: {
      secret,
    },
  })

  return _auth
}

/**
 * Validates that required auth environment variables are properly set.
 * Call this at the start of any auth-dependent server action or API route.
 */
export function validateAuthEnv() {
  if (!process.env.NEON_AUTH_BASE_URL) {
    throw new Error('NEON_AUTH_BASE_URL is required. Please set it in your environment variables.')
  }
  if (!process.env.NEON_AUTH_COOKIE_SECRET || process.env.NEON_AUTH_COOKIE_SECRET.length < 32) {
    throw new Error('NEON_AUTH_COOKIE_SECRET must be at least 32 characters long.')
  }
}

// Proxy object that lazily initializes auth on first property access
export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop) {
    return getAuth()[prop as keyof NeonAuth]
  },
})


