import { createNeonAuth } from '@neondatabase/auth/next/server'
import { NextResponse, NextRequest } from 'next/server'

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

function createDisabledAuth(): NeonAuth {
  const mockSession = {
    session: {
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'dev@local.test',
        name: 'Local Dev User',
      },
    },
  }

  const disabledResponse = new Response(
    'Authentication is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET to enable auth.',
    { status: 503 }
  )

  return {
    getSession: async () => ({
      data: mockSession,
      error: null,
    }),
    signIn: {
      email: async () => ({
        data: mockSession,
        error: null,
      }),
    },
    signUp: {
      email: async () => ({
        data: mockSession,
        error: null,
      }),
    },
    signOut: async () => ({
      data: null,
      error: null,
    }),
    handler: () => ({
      GET: async () => disabledResponse.clone(),
      POST: async () => disabledResponse.clone(),
    }),
    middleware: () => (_request: NextRequest) => {
      // In dev mode with disabled auth, allow all requests through without validation
      // The app pages will get the mock session from auth.getSession()
      return NextResponse.next()
    },
  } as NeonAuth
}

function getAuth(): NeonAuth {
  if (_auth) return _auth

  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const secret = process.env.NEON_AUTH_COOKIE_SECRET

  if (!baseUrl || !secret) {
    if (process.env.NODE_ENV === 'production') {
      const { baseUrl: requiredBaseUrl, secret: requiredSecret } = getRequiredAuthEnv()

      _auth = createNeonAuth({
        baseUrl: requiredBaseUrl,
        cookies: {
          secret: requiredSecret,
        },
      })

      return _auth
    }

    _auth = createDisabledAuth()
    return _auth
  }

  if (secret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters long.")
  }

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


