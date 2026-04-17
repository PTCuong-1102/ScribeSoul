import { db } from "@/lib/db";
import { documentChunks, chunkEmbeddings } from "@/lib/db/schema/ai";
import { documents } from "@/lib/db/schema/documents";
import { sql, eq, and, inArray } from "drizzle-orm";
import { generateEmbedding } from "./embedder";

export interface RetrievalResult {
  content: string;
  docTitle: string;
  docId: string;
  score: number;
}

/**
 * Performs semantic search using pgvector cosine distance.
 * Can be scoped to a specific workspace, document, or full project.
 */
export async function retrieveContext(
  workspaceId: string, 
  query: string, 
  limit = 5,
  scope?: { documentIds?: string[] }
): Promise<RetrievalResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  // Format embedding for SQL (drizzle-orm doesn't support vector type natively in the same way, 
  // so we use sql template with cast)
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  // SQL for cosine similarity: 1 - (vec1 <=> vec2)
  // we use <=> which is cosine distance
  const results = await db.execute(sql`
    SELECT 
      ${documentChunks.content},
      ${documents.title} as doc_title,
      ${documents.id} as doc_id,
      1 - (ce.embedding <=> ${vectorStr}::vector) as similarity
    FROM ${documentChunks}
    JOIN ${documents} ON ${documentChunks.documentId} = ${documents.id}
    JOIN ${chunkEmbeddings} ce ON ce.chunk_id = ${documentChunks.id}
    WHERE ${documents.workspaceId} = ${workspaceId}
    ${scope?.documentIds ? sql` AND ${documents.id} IN ${scope.documentIds}` : sql``}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return results.rows.map((r: any) => ({
    content: r.content,
    docTitle: r.doc_title,
    docId: r.doc_id,
    score: r.similarity
  }));
}
