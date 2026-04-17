"use server"

import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, asc } from "drizzle-orm"
import { auth } from "@/auth"

async function validateDocumentAccess(documentId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: {
      workspace: true
    }
  })

  if (!doc) throw new Error("Document không tồn tại")
  if (doc.workspace.ownerId !== session.user.id) throw new Error("Không có quyền truy cập")
  
  return doc
}

export async function getDocumentBlocks(documentId: string) {
  await validateDocumentAccess(documentId)

  return db.query.blocks.findMany({
    where: eq(blocks.documentId, documentId),
    orderBy: [asc(blocks.sortOrder)],
  })
}
