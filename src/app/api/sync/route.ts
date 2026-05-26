export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, and, inArray, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { ingestDocument } from "@/lib/ai/ingest"
import { checkRateLimit } from "@/lib/rate-limit"

// In-memory debounce map to coalesce ingests for the same document
const pendingIngestTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleIngest(documentId: string): void {
  const existing = pendingIngestTimers.get(documentId)
  if (existing) clearTimeout(existing)
  pendingIngestTimers.set(documentId, setTimeout(() => {
    pendingIngestTimers.delete(documentId)
    ingestDocument(documentId).catch(err => {
      console.error("[SYNC_INGEST_ERROR] Failed to ingest after sync:", err)
    })
  }, 5000))
}

const syncSchema = z.object({
  documentId: z.string().uuid(),
  upsert: z.array(z.object({
    id: z.string().uuid().optional(),
    type: z.string(),
    content: z.any(),
    sortOrder: z.number(),
    parentBlockId: z.string().uuid().optional().nullable(),
  })).max(1000, "Quá nhiều blocks để đồng bộ (tối đa 1000)"),
  deletions: z.array(z.string().uuid()).max(500, "Quá nhiều deletions (tối đa 500)"),
})

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    // Rate limit: 120 sync requests per minute per user
    const rateLimitKey = `sync:${session.user.id}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, 120, "1 m")
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Quá nhiều yêu cầu đồng bộ. Vui lòng thử lại sau.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: new Date(rateLimitResult.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "120",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      )
    }

    const body = await req.json()
    const validated = syncSchema.parse(body)

    // Check ownership
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, validated.documentId),
      with: { workspace: true }
    })
    
    if (!doc || doc.workspace.ownerId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await db.transaction(async (tx) => {
      // Process deletions
      if (validated.deletions.length > 0) {
        await tx.delete(blocks)
          .where(and(
            eq(blocks.documentId, validated.documentId),
            inArray(blocks.id, validated.deletions)
          ))
      }

      if (validated.upsert.length > 0) {
        const allValues = validated.upsert.map(item => ({
          id: item.id || crypto.randomUUID(),
          documentId: validated.documentId,
          type: item.type,
          content: item.content,
          sortOrder: item.sortOrder,
          parentBlockId: item.parentBlockId,
          updatedAt: new Date(),
        }))

        if (allValues.length > 0) {
          await tx.insert(blocks)
            .values(allValues)
            .onConflictDoUpdate({
              target: blocks.id,
              set: {
                type: sql`excluded.type`,
                content: sql`excluded.content`,
                sortOrder: sql`excluded.sort_order`,
                parentBlockId: sql`excluded.parent_block_id`,
                updatedAt: sql`excluded.updated_at`,
              }
            })
        }
      }
    })

    // Update document updatedAt timestamp
    await db.update(documents)
      .set({ updatedAt: new Date() })
      .where(eq(documents.id, validated.documentId))

    // Debounced ingestion: coalesces rapid syncs for the same document
    // into a single ingest call after 5s of inactivity.
    // This prevents race conditions and excessive OpenAI API calls.
    scheduleIngest(validated.documentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SYNC_ERROR]", error)
    if (error instanceof z.ZodError) return NextResponse.json(error.issues, { status: 400 })
    return new NextResponse("Internal Error", { status: 500 })
  }
}
