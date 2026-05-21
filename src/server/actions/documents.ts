"use server"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and, asc, desc, ilike, inArray, gte, sql } from "drizzle-orm"
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

/**
 * Authenticate user first, then return the session user ID.
 * Use this when you need to check auth before any DB query.
 */
async function requireAuth() {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")
  return session.user.id
}

interface ProductivityStats {
  wordsToday: number
  streak: number
  wordsDelta: number
  percentOfGoal: number
  dailyGoal: number
}

function toLocalDayKey(date: Date, timezone?: string) {
  try {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(date) // "YYYY-MM-DD"
  } catch (e) {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}

function getStartOfTodayInTimezone(timezone?: string): Date {
  const now = new Date()
  if (!timezone) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  try {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const dateStr = formatter.format(now) // "YYYY-MM-DD"
    
    // Find offset
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const offsetMs = tzDate.getTime() - utcDate.getTime()
    
    const [y, m, d] = dateStr.split('-').map(Number)
    const midnightUtc = Date.UTC(y, m - 1, d)
    return new Date(midnightUtc - offsetMs)
  } catch (e) {
    console.error(`[TIMEZONE] Failed to calculate start of today for timezone ${timezone}:`, e)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
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

// BUG 2 FIX: Check auth BEFORE querying document data to prevent IDOR
export async function getDocument(id: string) {
  const userId = await requireAuth()

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      workspace: true,
      blocks: {
        orderBy: (blk, { asc }) => [asc(blk.sortOrder)],
      },
    },
  })
  
  if (!doc) throw new Error("Document không tồn tại")
  
  // Verify the authenticated user owns the workspace
  if (doc.workspace.ownerId !== userId) {
    throw new Error("Không có quyền truy cập document này")
  }
  
  return doc
}

export async function updateDocument(id: string, data: Partial<z.infer<typeof documentSchema>>) {
  const existing = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  })
  if (!existing) throw new Error("Document không tồn tại")
  
  await checkWorkspaceOwnership(existing.workspaceId)

  // Validate partial data and strip workspaceId to prevent IDOR workspace switching
  const validated = documentSchema.partial().parse(data)
  const { workspaceId: _, ...updateFields } = validated

  const [updated] = await db
    .update(documents)
    .set({
      ...updateFields,
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
  const safeLimit = Math.min(limit, 50)
  
  return db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    orderBy: [desc(documents.updatedAt)],
    limit: safeLimit,
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

// BUG 8 FIX: Only count words from blocks updated today, not total words in those blocks.
// We filter blocks by updatedAt >= start of today, then sum their word counts.
// This is still an approximation (editing a block counts all its words),
// but at least it won't count blocks that weren't touched today.
export async function getProductivityStats(workspaceId: string, timezone?: string): Promise<ProductivityStats> {
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

  // Calculate start of today and yesterday based on timezone for precise filtering
  const startOfToday = getStartOfTodayInTimezone(timezone)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  // Fetch only blocks updated today (for today's word count)
  const todayBlocks = await db.query.blocks.findMany({
    where: and(
      inArray(blocks.documentId, docIds),
      gte(blocks.updatedAt, startOfToday)
    ),
    columns: { content: true },
  })

  const wordsToday = todayBlocks.reduce((sum, block) => {
    return sum + countWords(extractBlockText(block.content))
  }, 0)

  // Fetch blocks updated yesterday (for delta calculation)
  const yesterdayBlocks = await db.query.blocks.findMany({
    where: and(
      inArray(blocks.documentId, docIds),
      gte(blocks.updatedAt, startOfYesterday),
      // Note: we fetch yesterday onward and filter
    ),
    columns: {
      content: true,
      updatedAt: true,
    },
  })

  const wordsYesterday = yesterdayBlocks
    .filter(b => {
      const d = new Date(b.updatedAt)
      return d >= startOfYesterday && d < startOfToday
    })
    .reduce((sum, block) => sum + countWords(extractBlockText(block.content)), 0)

  const wordsDelta = wordsToday - wordsYesterday

  // Limit streak calculation query to 365 days lookback for performance optimization
  const lookbackLimit = new Date(startOfToday)
  lookbackLimit.setDate(lookbackLimit.getDate() - 365)

  // Get unique activity days using high-performance SQL DISTINCT query with timezone offset
  const dbTimezone = timezone || 'UTC'
  const activeDates = await db
    .select({
      date: sql<string>`DISTINCT (timezone(${dbTimezone}, ${blocks.updatedAt})::date)::text`
    })
    .from(blocks)
    .where(
      and(
        inArray(blocks.documentId, docIds),
        gte(blocks.updatedAt, lookbackLimit)
      )
    )

  const daysWithActivity = new Set(
    activeDates.map(r => r.date)
  )

  let streak = 0
  const cursor = new Date(startOfToday)
  
  if (!daysWithActivity.has(toLocalDayKey(cursor, timezone))) {
    // If no activity today, check yesterday to keep streak active
    cursor.setDate(cursor.getDate() - 1)
  }

  while (daysWithActivity.has(toLocalDayKey(cursor, timezone))) {
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

// BUG 3 FIX: Deep circular reference detection for document tree
/**
 * Check if `targetId` is an ancestor of `documentId` in the document tree.
 * If so, moving `documentId` under `targetId` would create a cycle.
 */
async function isAncestor(documentId: string, targetId: string, workspaceId: string): Promise<boolean> {
  const allDocs = await db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    columns: { id: true, parentId: true },
  })

  const parentMap = new Map<string, string | null>()
  for (const doc of allDocs) {
    parentMap.set(doc.id, doc.parentId)
  }

  // Walk up from targetId; if we reach documentId, it's an ancestor
  let current: string | null | undefined = targetId
  const visited = new Set<string>()
  while (current) {
    if (current === documentId) return true
    if (visited.has(current)) return false // already a cycle in data, bail out
    visited.add(current)
    current = parentMap.get(current) ?? null
  }

  return false
}

export async function moveDocument(documentId: string, newParentId: string | null) {
  const existing = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  })
  if (!existing) throw new Error("Document không tồn tại")

  await checkWorkspaceOwnership(existing.workspaceId)

  // Prevent moving document into itself
  if (newParentId === documentId) {
    throw new Error("Không thể di chuyển tài liệu vào chính nó")
  }

  // If moving to a parent, verify parent exists and is in same workspace
  if (newParentId) {
    const parent = await db.query.documents.findFirst({
      where: eq(documents.id, newParentId),
    })
    if (!parent) throw new Error("Tài liệu cha không tồn tại")
    if (parent.workspaceId !== existing.workspaceId) {
      throw new Error("Không thể di chuyển giữa các workspace khác nhau")
    }

    // Deep circular reference check: ensure newParentId is not a descendant of documentId
    const wouldCycle = await isAncestor(documentId, newParentId, existing.workspaceId)
    if (wouldCycle) {
      throw new Error("Không thể di chuyển tài liệu vào tài liệu con của nó (tham chiếu vòng)")
    }
  }

  const [updated] = await db
    .update(documents)
    .set({
      parentId: newParentId,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning()

  revalidatePath(`/workspace/${existing.workspaceId}`)
  return updated
}
