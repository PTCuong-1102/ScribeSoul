"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema/documents"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and, asc, ilike } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const documentSchema = z.object({
  workspaceId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  type: z.enum(["doc", "character", "setting", "plot"]),
  status: z.enum(["draft", "revision", "finished", "idea"]),
  metadata: z.any().optional(),
})

async function checkWorkspaceOwnership(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const workspace = await db.query.workspaces.findFirst({
    where: and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)),
  })

  if (!workspace) throw new Error("Không có quyền truy cập workspace này")
  return session.user.id
}

export async function createDocument(data: z.infer<typeof documentSchema>) {
  await checkWorkspaceOwnership(data.workspaceId)
  const validated = documentSchema.parse(data)

  const [newDoc] = await db
    .insert(documents)
    .values({
      workspaceId: validated.workspaceId,
      parentId: validated.parentId,
      title: validated.title,
      type: validated.type,
      status: validated.status,
      metadata: validated.metadata || {},
    })
    .returning()

  revalidatePath(`/workspace/${validated.workspaceId}`)
  return newDoc
}

export async function getDocument(id: string) {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      blocks: {
        orderBy: (blk, { asc }) => [asc(blk.sortOrder)],
      },
    },
  })
  
  if (!doc) throw new Error("Document không tồn tại")
  await checkWorkspaceOwnership(doc.workspaceId)
  return doc
}

export async function updateDocument(id: string, data: Partial<z.infer<typeof documentSchema>>) {
  const existing = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  })
  if (!existing) throw new Error("Document không tồn tại")
  
  await checkWorkspaceOwnership(existing.workspaceId)

  const [updated] = await db
    .update(documents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning()

  revalidatePath(`/workspace/${existing.workspaceId}`)
  return updated
}

export async function deleteDocument(id: string) {
  const existing = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  })
  if (!existing) return

  await checkWorkspaceOwnership(existing.workspaceId)

  await db.delete(documents).where(eq(documents.id, id))
  
  revalidatePath(`/workspace/${existing.workspaceId}`)
}

export async function getDocumentTree(workspaceId: string) {
  await checkWorkspaceOwnership(workspaceId)
  
  return db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    orderBy: [asc(documents.createdAt)],
  })
}

export async function searchDocuments(workspaceId: string, query: string) {
  await checkWorkspaceOwnership(workspaceId)

  return db.query.documents.findMany({
    where: and(
      eq(documents.workspaceId, workspaceId),
      ilike(documents.title, `%${query}%`)
    ),
    limit: 10,
  })
}
