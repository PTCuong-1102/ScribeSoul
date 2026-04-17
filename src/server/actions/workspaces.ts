"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const workspaceSchema = z.object({
  name: z.string().min(1, "Tên workspace không được để trống").max(100),
  settings: z.any().optional(),
})

export async function createWorkspace(data: z.infer<typeof workspaceSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const validated = workspaceSchema.parse(data)

  const [newWorkspace] = await db
    .insert(workspaces)
    .values({
      ownerId: session.user.id,
      name: validated.name,
      settings: validated.settings || {},
    })
    .returning()

  revalidatePath("/workspace")
  return newWorkspace
}

export async function listWorkspaces() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.workspaces.findMany({
    where: eq(workspaces.ownerId, session.user.id),
    orderBy: (workspaces, { desc }) => [desc(workspaces.updatedAt)],
  })
}

export async function updateWorkspace(
  id: string,
  data: Partial<z.infer<typeof workspaceSchema>>
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const [updated] = await db
    .update(workspaces)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(workspaces.id, id), eq(workspaces.ownerId, session.user.id)))
    .returning()

  revalidatePath(`/workspace/${id}`)
  return updated
}

export async function deleteWorkspace(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  await db
    .delete(workspaces)
    .where(and(eq(workspaces.id, id), eq(workspaces.ownerId, session.user.id)))

  revalidatePath("/workspace")
}
