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
  
  // Use parameterized query for the vector embedding to prevent SQL injection.
  // Convert the embedding array to a SQL-safe string literal via a parameter,
  // then cast it to vector type on the database side.
  const embeddingParam = `[${queryEmbedding.join(',')}]`;

  // Build scope filter: if documentIds are provided, restrict search to those docs
  const scopeFilter = scope?.documentIds && scope.documentIds.length > 0
    ? sql` AND ${documents.id} IN (${sql.join(scope.documentIds.map(id => sql`${id}`), sql`, `)})`
    : sql``;

  // SQL for cosine similarity: 1 - (vec1 <=> vec2)
  // we use <=> which is cosine distance
  const results = await db.execute(sql`
    SELECT 
      ${documentChunks.content},
      ${documents.title} as doc_title,
      ${documents.id} as doc_id,
      1 - (ce.embedding <=> ${embeddingParam}::vector) as similarity
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
