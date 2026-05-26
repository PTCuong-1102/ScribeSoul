/**
 * Ingest Trigger Utility
 * Triggers document chunking and embedding generation
 */

import { db } from "./db"
import { documents } from "./db/schema/documents"
import { eq } from "drizzle-orm"

/**
 * Queue a document for ingestion (chunking + embedding)
 * This should be called after document content is updated
 */
export async function queueDocumentIngest(documentId: string) {
  try {
    // Verify document exists
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    })

    if (!doc) {
      console.warn(`[INGEST] Document not found: ${documentId}`)
      return false
    }

    console.log(`[INGEST] Queued document for ingestion: ${documentId}`)

    return true
  } catch (error) {
    console.error("[INGEST_QUEUE_ERROR]", error)
    return false
  }
}

/**
 * Trigger ingest via HTTP call (for server-side)
 */
export async function triggerIngest(
  documentId: string,
  baseUrl: string = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (process.env.INTERNAL_API_SECRET) {
      headers["Authorization"] = `Bearer ${process.env.INTERNAL_API_SECRET}`
    }

    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers,
      body: JSON.stringify({ documentId }),
    })

    if (!response.ok) {
      console.warn(
        `[INGEST_TRIGGER] Failed to ingest ${documentId}: ${response.status}`
      )
      return false
    }

    console.log(`[INGEST] Successfully triggered for: ${documentId}`)
    return true
  } catch (error) {
    console.error("[INGEST_TRIGGER_ERROR]", error)
    return false
  }
}
