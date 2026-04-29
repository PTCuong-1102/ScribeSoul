"use server"

import { retrieveContext } from "@/lib/ai/retriever"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema/documents"
import { documentLinks } from "@/lib/db/schema/links"
import { eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth/server"

export async function semanticSearch(workspaceId: string, query: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user) throw new Error("Unauthorized")

  try {
    const results = await retrieveContext(workspaceId, query, 10)
    
    // Group results by document to give a better search experience (like Cmd+K)
    // and map them to the format expected by CommandSearch.tsx
    return results.map((r, index) => ({
      id: `${r.docId}-${index}`,
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
  const { data: session } = await auth.getSession()
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

    const docIds = docs.map(d => d.id)
    let links: { source: string, target: string, label?: string }[] = []

    if (docIds.length > 0) {
      const dbLinks = await db.query.documentLinks.findMany({
        where: inArray(documentLinks.sourceId, docIds),
        columns: {
          sourceId: true,
          targetId: true,
          type: true,
        }
      })
      
      // Map to the format expected by the frontend graph (usually source, target, label/type)
      links = dbLinks.map(l => ({
        source: l.sourceId,
        target: l.targetId,
        label: l.type // Optional label depending on the library
      }))
    }

    return {
      nodes: docs.map(d => ({
        id: d.id,
        label: d.title || "Untitled",
        type: d.type
      })),
      links
    }
  } catch (error) {
    console.error("Knowledge graph error:", error)
    return { nodes: [], links: [] }
  }
}
