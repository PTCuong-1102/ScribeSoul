export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, and, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"

const syncSchema = z.object({
  documentId: z.string().uuid(),
  upsert: z.array(z.object({
    id: z.string().uuid().optional(),
    type: z.string(),
    content: z.any(),
    sortOrder: z.number(),
    parentBlockId: z.string().uuid().optional().nullable(),
  })),
  deletions: z.array(z.string().uuid()),
})

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

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

      // Process upserts using a bulk strategy:
      // 1. Separate items with IDs (potential updates) from new items
      // 2. For items with IDs, delete all existing and re-insert in bulk
      //    This avoids N+1 SELECT+UPDATE pattern and handles both insert/update cases
      if (validated.upsert.length > 0) {
        const itemsWithId = validated.upsert.filter(item => item.id)
        const itemsWithoutId = validated.upsert.filter(item => !item.id)

        // Delete existing blocks for this document that match incoming IDs,
        // then re-insert them with updated data
        if (itemsWithId.length > 0) {
          const existingIds = itemsWithId.map(item => item.id as string)
          await tx.delete(blocks)
            .where(and(
              eq(blocks.documentId, validated.documentId),
              inArray(blocks.id, existingIds)
            ))
        }

        // Bulk insert all items (both with and without explicit IDs)
        const allValues = [
          ...itemsWithId.map(item => ({
            id: item.id,
            documentId: validated.documentId,
            type: item.type,
            content: item.content,
            sortOrder: item.sortOrder,
            parentBlockId: item.parentBlockId,
            updatedAt: new Date(),
          })),
          ...itemsWithoutId.map(item => ({
            documentId: validated.documentId,
            type: item.type,
            content: item.content,
            sortOrder: item.sortOrder,
            parentBlockId: item.parentBlockId,
          })),
        ]

        if (allValues.length > 0) {
          await tx.insert(blocks).values(allValues)
        }
      }
    })

    // Update document updatedAt timestamp
    await db.update(documents)
      .set({ updatedAt: new Date() })
      .where(eq(documents.id, validated.documentId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SYNC_ERROR]", error)
    if (error instanceof z.ZodError) return NextResponse.json(error.issues, { status: 400 })
    return new NextResponse("Internal Error", { status: 500 })
  }
}
