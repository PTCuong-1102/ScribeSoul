"use server"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { aiConversations, aiMessages } from "@/lib/db/schema/ai"
import { workspaces } from "@/lib/db/schema/workspaces"
import { eq, and, desc, asc } from "drizzle-orm"

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
 * Lấy danh sách các cuộc trò chuyện AI của một workspace
 */
export async function getConversations(workspaceId: string) {
  await checkWorkspaceOwnership(workspaceId)
  
  return db.query.aiConversations.findMany({
    where: eq(aiConversations.workspaceId, workspaceId),
    orderBy: [desc(aiConversations.updatedAt)],
  })
}

/**
 * Tạo mới một cuộc trò chuyện AI
 */
export async function createConversation(workspaceId: string, title?: string) {
  const userId = await checkWorkspaceOwnership(workspaceId)
  
  const [newConv] = await db
    .insert(aiConversations)
    .values({
      userId,
      workspaceId,
      title: title || "Cuộc trò chuyện mới",
      contextType: "full-project",
    })
    .returning()
    
  return newConv
}

/**
 * Xóa một cuộc trò chuyện AI (tự động cascade xóa tin nhắn)
 */
export async function deleteConversation(conversationId: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const conv = await db.query.aiConversations.findFirst({
    where: eq(aiConversations.id, conversationId),
  })
  
  if (!conv) throw new Error("Không tìm thấy cuộc trò chuyện")
  await checkWorkspaceOwnership(conv.workspaceId)

  await db.delete(aiConversations).where(eq(aiConversations.id, conversationId))
  
  return { success: true }
}

/**
 * Lấy danh sách toàn bộ tin nhắn thuộc một cuộc trò chuyện
 */
export async function getConversationMessages(conversationId: string) {
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Chưa đăng nhập")

  const conv = await db.query.aiConversations.findFirst({
    where: eq(aiConversations.id, conversationId),
  })
  
  if (!conv) throw new Error("Không tìm thấy cuộc trò chuyện")
  await checkWorkspaceOwnership(conv.workspaceId)

  return db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, conversationId),
    orderBy: [asc(aiMessages.createdAt)],
  })
}
