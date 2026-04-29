import { createNeonAuth } from '@neondatabase/auth/next/server'

type NeonAuth = ReturnType<typeof createNeonAuth>

let _auth: NeonAuth | null = null

function getRequiredAuthEnv() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const secret = process.env.NEON_AUTH_COOKIE_SECRET

  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is required. Please set it in your environment variables.")
  }

  if (!secret || secret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters long.")
  }

  return { baseUrl, secret }
}

function getAuth(): NeonAuth {
  if (_auth) return _auth

  const { baseUrl, secret } = getRequiredAuthEnv()

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
  getRequiredAuthEnv()
}

// Proxy object that lazily initializes auth on first property access
export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop) {
    return getAuth()[prop as keyof NeonAuth]
  },
})


