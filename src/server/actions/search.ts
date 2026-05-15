"use server"

import { retrieveContext } from "@/lib/ai/retriever"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema/documents"
import { documentLinks } from "@/lib/db/schema/links"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, inArray, and } from "drizzle-orm"
import { auth } from "@/lib/auth/server"

export async function semanticSearch(workspaceId: string, query: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
    // FIX 1: Verify workspace ownership before querying
    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.id, workspaceId),
        eq(workspaces.ownerId, session.user.id)
      ),
    })

    if (!workspace) {
      throw new Error("Workspace not found or unauthorized")
    }

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
    // FIX 4: Return error info instead of silent failure
    if (error instanceof Error && error.message === "Workspace not found or unauthorized") {
      throw new Error("Workspace not found or unauthorized")
    }
    // Only return empty for actual "no results", re-throw auth errors
    throw error
  }
}

export async function getKnowledgeGraph(workspaceId: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
    // FIX 1: Verify workspace ownership before querying
    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.id, workspaceId),
        eq(workspaces.ownerId, session.user.id)
      ),
    })

    if (!workspace) {
      throw new Error("Workspace not found or unauthorized")
    }

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
    // FIX 4: Re-throw auth errors instead of silent failure
    if (error instanceof Error && error.message.includes("Workspace not found")) {
      throw error
    }
    throw error
  }
}
