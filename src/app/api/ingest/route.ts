export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth/server"
import { ingestDocument } from "@/lib/ai/ingest"
import { documents } from "@/lib/db/schema/documents"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const ingestSchema = z.object({
  documentId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession()
    const authHeader = req.headers.get("Authorization")
    const isInternal = authHeader && authHeader === `Bearer ${process.env.INTERNAL_API_SECRET}`

    if (!session?.user?.id && !isInternal) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { documentId } = ingestSchema.parse(body)

    // Check ownership
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
      with: { workspace: true }
    })

    if (!doc) {
      return new NextResponse("Document Not Found", { status: 404 })
    }

    if (session?.user?.id && doc.workspace.ownerId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Rate Limit Check for session users (10 ingests per hour)
    if (session?.user?.id) {
      const rateLimitKey = `ingest:${session.user.id}`
      const rateLimitResult = await checkRateLimit(rateLimitKey, 10, "1 h")
      if (!rateLimitResult.success) {
        return new NextResponse(
          JSON.stringify({
            error: "Too many ingest requests. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: new Date(rateLimitResult.reset).toISOString(),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": "10",
              "X-RateLimit-Remaining": String(rateLimitResult.remaining),
              "X-RateLimit-Reset": String(rateLimitResult.reset),
            },
          }
        )
      }
    }

    const result = await ingestDocument(documentId)

    return NextResponse.json({ success: result.success, count: result.count })
  } catch (error) {
    console.error("[INGEST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
