import { db } from "@/lib/db"
import { documentChunks, chunkEmbeddings } from "@/lib/db/schema/ai"
import { blocks as blocksTable } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, asc } from "drizzle-orm"
import { chunkBlocks, estimateTokens, type BasicBlock } from "./chunker"
import { generateEmbeddings } from "./embedder"

export async function ingestDocument(documentId: string): Promise<{ success: boolean; count: number; message?: string }> {
  try {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    })

    if (!doc) {
      return { success: false, count: 0, message: "Document not found" }
    }

    const currentBlocks = await db.query.blocks.findMany({
      where: eq(blocksTable.documentId, documentId),
      orderBy: [asc(blocksTable.sortOrder)],
    })

    if (currentBlocks.length === 0) {
      return { success: true, count: 0, message: "No content to ingest" }
    }

    // Map Drizzle block type to BasicBlock — both share the same shape
    const mappedBlocks: BasicBlock[] = currentBlocks.map(b => ({
      id: b.id,
      content: b.content as BasicBlock["content"],
      type: b.type,
      sortOrder: b.sortOrder,
      parentBlockId: b.parentBlockId,
    }))

    const chunks = chunkBlocks(documentId, mappedBlocks)

    const embeddingResults = await generateEmbeddings(chunks.map(c => c.content))

    await db.transaction(async (tx) => {
      await tx.delete(documentChunks).where(eq(documentChunks.documentId, documentId))

      if (chunks.length > 0) {
        const newChunks = await tx.insert(documentChunks).values(
          chunks.map(chunk => ({
            documentId: chunk.metadata.docId,
            content: chunk.content,
            metadata: { blockIds: chunk.metadata.blockIds },
            tokenCount: estimateTokens(chunk.content),
          }))
        ).returning()

        const embeddingValues = newChunks.map((newChunk, i) => ({
          chunkId: newChunk.id,
          embedding: embeddingResults[i],
        }))

        if (embeddingValues.length > 0) {
          await tx.insert(chunkEmbeddings).values(embeddingValues)
        }
      }
    })

    return { success: true, count: chunks.length }
  } catch (error) {
    console.error("[INGEST_DOCUMENT_ERROR]", error)
    return { success: false, count: 0, message: "Ingestion failed" }
  }
}
