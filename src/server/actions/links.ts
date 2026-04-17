"use server"

import { db } from "@/lib/db"
import { documentLinks } from "@/lib/db/schema/links"
import { documents } from "@/lib/db/schema/documents"
import { eq, and } from "drizzle-orm"
import { auth } from "@/auth"

async function validateDocumentOwner(documentId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { workspace: true }
  })

  return doc?.workspace.ownerId === session.user.id
}

export async function getBacklinks(documentId: string) {
  if (!await validateDocumentOwner(documentId)) throw new Error("Unauthorized")

  return db.query.documentLinks.findMany({
    where: eq(documentLinks.targetId, documentId),
    with: {
      source: true // The document that points link TO this document
    }
  })
}

export async function createLink(sourceId: string, targetId: string, type: "mention" | "reference" | "plot-link" | "character-link" = "mention") {
  if (!await validateDocumentOwner(sourceId)) throw new Error("Unauthorized")

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

  return db.delete(documentLinks)
    .where(and(
      eq(documentLinks.sourceId, sourceId),
      eq(documentLinks.targetId, targetId)
    ))
}
