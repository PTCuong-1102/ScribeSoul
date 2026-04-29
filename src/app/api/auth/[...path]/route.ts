import { auth } from '@/lib/auth/server'

type AuthRouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: Request, context: AuthRouteContext) {
  const handler = auth.handler()
  return handler.GET(request, context)
}

export async function POST(request: Request, context: AuthRouteContext) {
  const handler = auth.handler()
  return handler.POST(request, context)
}
