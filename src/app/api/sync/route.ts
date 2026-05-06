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

    // Process deletions
    if (validated.deletions.length > 0) {
      await db.delete(blocks)
        .where(and(
          eq(blocks.documentId, validated.documentId),
          inArray(blocks.id, validated.deletions)
        ))
    }

    // Process upserts with transaction
    if (validated.upsert.length > 0) {
      await db.transaction(async (tx) => {
        for (const item of validated.upsert) {
          if (item.id) {
            // Check if block exists
            const existing = await tx.query.blocks.findFirst({
              where: eq(blocks.id, item.id),
            })

            if (existing) {
              // Update existing block
              await tx.update(blocks)
                .set({
                  content: item.content,
                  sortOrder: item.sortOrder,
                  type: item.type,
                  parentBlockId: item.parentBlockId,
                  updatedAt: new Date()
                })
                .where(eq(blocks.id, item.id))
            } else {
              // Insert new block with specific ID
              await tx.insert(blocks).values({
                id: item.id,
                documentId: validated.documentId,
                type: item.type,
                content: item.content,
                sortOrder: item.sortOrder,
                parentBlockId: item.parentBlockId,
              })
            }
          } else {
            // Insert new block (ID auto-generated)
            await tx.insert(blocks).values({
              documentId: validated.documentId,
              type: item.type,
              content: item.content,
              sortOrder: item.sortOrder,
              parentBlockId: item.parentBlockId,
            })
          }
        }
      })
    }

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
