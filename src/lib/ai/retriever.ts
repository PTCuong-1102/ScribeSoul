import { db } from "@/lib/db";
import { documentChunks, chunkEmbeddings } from "@/lib/db/schema/ai";
import { documents } from "@/lib/db/schema/documents";
import { sql } from "drizzle-orm";
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
  
  // Convert embedding array to pgvector-compatible string format.
  // Passed as a parameterized value via Drizzle sql template (${embeddingStr}::vector),
  // which sends it as a bind parameter ($N::vector) instead of interpolating into SQL text,
  // preventing SQL injection.
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  // Build scope filter: if documentIds are provided, restrict search to those docs.
  // Each id is passed as a parameterized value via sql template literal.
  const scopeFilter = scope?.documentIds && scope.documentIds.length > 0
    ? sql`AND ${documents.id} IN (${sql.join(scope.documentIds.map(id => sql`${id}`), sql`, `)})`
    : sql``;

  const results = await db.execute(sql`
    SELECT 
      ${documentChunks.content},
      ${documents.title} AS doc_title,
      ${documents.id} AS doc_id,
      1 - (ce.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM ${documentChunks}
    JOIN ${documents} ON ${documentChunks.documentId} = ${documents.id}
    JOIN ${chunkEmbeddings} ce ON ce.chunk_id = ${documentChunks.id}
    WHERE ${documents.workspaceId} = ${workspaceId}
    ${scopeFilter}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return results.rows.map((r: Record<string, unknown>) => ({
    content: r.content as string,
    docTitle: r.doc_title as string,
    docId: r.doc_id as string,
    score: r.similarity as number
  }));
}
