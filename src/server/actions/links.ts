"use server"

import { db } from "@/lib/db"
import { documentLinks } from "@/lib/db/schema/links"
import { documents } from "@/lib/db/schema/documents"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth/server"

async function validateDocumentOwner(documentId: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { workspace: true }
  })

  return doc?.workspace.ownerId === session.user.id
}

export interface BacklinkResult {
  id: string
  type: string
  source: {
    id: string
    title: string | null
    workspaceId: string
  }
}

export async function getBacklinks(documentId: string): Promise<BacklinkResult[]> {
  if (!await validateDocumentOwner(documentId)) throw new Error("Unauthorized")

  const raw = await db.query.documentLinks.findMany({
    where: eq(documentLinks.targetId, documentId),
    with: {
      source: {
        columns: { id: true, title: true, workspaceId: true },
      },
    },
  })

  return raw as unknown as BacklinkResult[]
}

export async function createLink(sourceId: string, targetId: string, type: "mention" | "reference" | "plot-link" | "character-link" = "mention") {
  if (!await validateDocumentOwner(sourceId)) throw new Error("Unauthorized")
  if (!await validateDocumentOwner(targetId)) throw new Error("Unauthorized")

  return db.insert(documentLinks)
    .values({
      sourceId,
      targetId,
      type
    })
    .onConflictDoUpdate({
      target: [documentLinks.sourceId, documentLinks.targetId],
      set: { type }
    })
    .returning()
}

export async function deleteLink(sourceId: string, targetId: string) {
  if (!await validateDocumentOwner(sourceId)) throw new Error("Unauthorized")
  if (!await validateDocumentOwner(targetId)) throw new Error("Unauthorized")

  return db.delete(documentLinks)
    .where(and(
      eq(documentLinks.sourceId, sourceId),
      eq(documentLinks.targetId, targetId)
    ))
}
