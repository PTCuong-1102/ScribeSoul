"use server"

import { retrieveContext } from "@/lib/ai/retriever"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema/documents"
import { eq, and, sql } from "drizzle-orm"
import { auth } from "@/auth"

export async function semanticSearch(workspaceId: string, query: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  try {
    const results = await retrieveContext(workspaceId, query, 10)
    
    // Group results by document to give a better search experience (like Cmd+K)
    // and map them to the format expected by CommandSearch.tsx
    return results.map(r => ({
      id: r.docId + Math.random(), // Unique key for UI
      docId: r.docId,
      title: r.docTitle,
      excerpt: r.content.length > 150 ? r.content.substring(0, 150) + "..." : r.content,
      score: r.score
    }))
  } catch (error) {
    console.error("Semantic search error:", error)
    return []
  }
}

export async function getKnowledgeGraph(workspaceId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  try {
    // Fetch documents as nodes
    const docs = await db.query.documents.findMany({
      where: eq(documents.workspaceId, workspaceId),
      columns: {
        id: true,
        title: true,
        type: true,
      }
    })

    // In a real app, we'd fetch actual links from document_links table
    // For now, we'll return the nodes and empty links or mock them if schema allows
    return {
      nodes: docs.map(d => ({
        id: d.id,
        label: d.title || "Untitled",
        type: d.type
      })),
      links: [] // To be implemented with document_links
    }
  } catch (error) {
    console.error("Knowledge graph error:", error)
    return { nodes: [], links: [] }
  }
}
