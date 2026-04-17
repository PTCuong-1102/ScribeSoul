import { auth } from "@/auth"
import { db } from "@/lib/db"
import { documentChunks, chunkEmbeddings } from "@/lib/db/schema/ai"
import { blocks as blocksTable } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { chunkBlocks } from "@/lib/ai/chunker"
import { generateEmbeddings } from "@/lib/ai/embedder"
import { z } from "zod"

const ingestSchema = z.object({
  documentId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const body = await req.json()
    const { documentId } = ingestSchema.parse(body)

    // Check ownership
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
      with: { workspace: true }
    })
    
    if (!doc || doc.workspace.ownerId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Get current blocks
    const currentBlocks = await db.query.blocks.findMany({
      where: eq(blocksTable.documentId, documentId),
      orderBy: [asc(blocksTable.sortOrder)]
    })

    if (currentBlocks.length === 0) return NextResponse.json({ success: true, message: "No content to ingest" })

    // 1. Chunking
    const chunks = chunkBlocks(documentId, currentBlocks as any)

    // 2. Generate Embeddings
    const embeddingResults = await generateEmbeddings(chunks.map(c => c.content))

    // 3. Clear old chunks for this document and insert new ones (Transaction)
    await db.transaction(async (tx) => {
      // Drizzle doesn't have a direct "cascade delete" in simple way for transactions 
      // without relations setup in DB, but we do it manually here.
      await tx.delete(documentChunks).where(eq(documentChunks.documentId, documentId))
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = embeddingResults[i]

        const [newChunk] = await tx.insert(documentChunks).values({
          documentId: chunk.metadata.docId,
          content: chunk.content,
          metadata: { blockIds: chunk.metadata.blockIds }
        }).returning()

        await tx.insert(chunkEmbeddings).values({
          chunkId: newChunk.id,
          embedding: embedding
        })
      }
    })

    return NextResponse.json({ success: true, count: chunks.length })
  } catch (error) {
    console.error("[INGEST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
