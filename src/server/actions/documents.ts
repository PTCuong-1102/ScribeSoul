"use server"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and, asc, desc, ilike, inArray } from "drizzle-orm"
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
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const workspace = await db.query.workspaces.findFirst({
    where: and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)),
  })

  if (!workspace) throw new Error("Không có quyền truy cập workspace này")
  return session.user.id
}

interface ProductivityStats {
  wordsToday: number
  streak: number
  wordsDelta: number
  percentOfGoal: number
  dailyGoal: number
}

function toLocalDayKey(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function extractBlockText(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""

  return content
    .map((item) => {
      if (!item || typeof item !== "object") return ""
      const text = (item as { text?: unknown }).text
      return typeof text === "string" ? text : ""
    })
    .join(" ")
    .trim()
}

function countWords(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
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

  // Escape SQL LIKE wildcards to prevent pattern injection
  const safeQuery = query.replace(/[%_\\]/g, '\\$&')

  return db.query.documents.findMany({
    where: and(
      eq(documents.workspaceId, workspaceId),
      ilike(documents.title, `%${safeQuery}%`)
    ),
    limit: 10,
  })
}

export async function getRecentDocuments(workspaceId: string, limit: number = 5) {
  await checkWorkspaceOwnership(workspaceId)
  
  return db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    orderBy: [desc(documents.updatedAt)],
    limit,
  })
}

export async function getDocumentsByType(workspaceId: string, type: "character" | "setting" | "plot") {
  await checkWorkspaceOwnership(workspaceId)
  
  return db.query.documents.findMany({
    where: and(
      eq(documents.workspaceId, workspaceId),
      eq(documents.type, type)
    ),
    orderBy: [desc(documents.updatedAt)],
  })
}

export async function getProductivityStats(workspaceId: string): Promise<ProductivityStats> {
  await checkWorkspaceOwnership(workspaceId)

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    columns: { settings: true },
  })

  const settings = workspace?.settings as Record<string, unknown> | undefined
  const goalFromSettings = settings?.dailyWordGoal
  const dailyGoal = typeof goalFromSettings === "number" && goalFromSettings > 0
    ? Math.floor(goalFromSettings)
    : 2000

  const workspaceDocs = await db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    columns: { id: true },
  })

  if (workspaceDocs.length === 0) {
    return {
      wordsToday: 0,
      streak: 0,
      wordsDelta: 0,
      percentOfGoal: 0,
      dailyGoal,
    }
  }

  const docIds = workspaceDocs.map((doc) => doc.id)
  const workspaceBlocks = await db.query.blocks.findMany({
    where: inArray(blocks.documentId, docIds),
    columns: {
      content: true,
      updatedAt: true,
    },
  })

  const dayWords = new Map<string, number>()

  for (const block of workspaceBlocks) {
    const words = countWords(extractBlockText(block.content))
    if (words === 0) continue

    const dayKey = toLocalDayKey(new Date(block.updatedAt))
    dayWords.set(dayKey, (dayWords.get(dayKey) ?? 0) + words)
  }

  const today = new Date()
  const todayKey = toLocalDayKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toLocalDayKey(yesterday)

  const wordsToday = dayWords.get(todayKey) ?? 0
  const wordsYesterday = dayWords.get(yesterdayKey) ?? 0
  const wordsDelta = wordsToday - wordsYesterday

  const daysWithActivity = new Set(dayWords.keys())
  let streak = 0
  const cursor = new Date(today)
  while (daysWithActivity.has(toLocalDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const percentOfGoal = Math.min(100, Math.round((wordsToday / dailyGoal) * 100))

  return {
    wordsToday,
    streak,
    wordsDelta,
    percentOfGoal,
    dailyGoal,
  }
}
