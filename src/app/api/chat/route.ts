export const dynamic = 'force-dynamic'
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { aiMessages, aiConversations } from "@/lib/db/schema/ai";
import { workspaces } from "@/lib/db/schema/workspaces";
import { retrieveContext } from "@/lib/ai/retriever";
import { AI_CONFIG } from "@/lib/ai/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, and } from "drizzle-orm";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { messages, workspaceId, conversationId } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // FIX 1: Verify workspace ownership before processing
    const workspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.id, workspaceId),
        eq(workspaces.ownerId, session.user.id)
      ),
    });

    if (!workspace) {
      return new Response(
        JSON.stringify({ error: "Workspace not found or unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const rateLimitKey = `chat:${session.user.id}:${workspaceId}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 20, "1 h");
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Too many chat requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: new Date(rateLimitResult.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      );
    }

    // FIX 2: Verify conversationId ownership if provided
    if (conversationId) {
      const conversation = await db.query.aiConversations.findFirst({
        where: and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, session.user.id),
          eq(aiConversations.workspaceId, workspaceId)
        ),
      });

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: "Conversation not found or unauthorized" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 1. Retrieve Context (RAG)
    const contextResults = await retrieveContext(workspaceId, lastMessage, 5);
    const contextText = contextResults
      .map((r, i) => `[ID: ${i}] (Nguồn: ${r.docTitle})\n${r.content}`)
      .join("\n\n---\n\n");

    const systemPrompt = `
      Bạn là Soul Assistant, trợ lý sáng tác thông minh cho nhà văn trong hệ thống ScribeSoul.
      Phong cách: Chuyên nghiệp, sâu sắc, cổ điển (literary), thấu hiểu.
      
      Dưới đây là ngữ cảnh liên quan từ kho dữ liệu (Thư viện) của người dùng:
      ${contextText}

      HƯỚNG DẪN:
      1. Sử dụng ngữ cảnh trên để trả lời các câu hỏi về nhân vật, cốt truyện, bối cảnh.
      2. Nếu thông tin không có trong ngữ cảnh, hãy thừa nhận và gợi ý dựa trên tư duy sáng tạo.
      3. Khi trích dẫn thông tin từ thư viện, hãy ghi chú nguồn (VD: Theo chương 1...).
      4. Luôn khuyến khích và khơi gợi sự sáng tạo của tác giả.
    `;

    // 2. Stream AI Response
    const result = streamText({
      model: openai(AI_CONFIG.chatModel),
      system: systemPrompt,
      messages,
      onFinish: async ({ text, usage }) => {
        // Save conversation and messages to DB
        if (conversationId) {
          // Save user message with zeroed usage (usage belongs to the response)
          await db.insert(aiMessages).values([
            {
              conversationId: conversationId,
              role: "user",
              content: lastMessage,
              tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            },
            {
              conversationId: conversationId,
              role: "assistant",
              content: text,
              citations: contextResults.map(r => ({ docId: r.docId, title: r.docTitle })),
              // Store full token usage on the assistant message for accurate tracking
              tokenUsage: {
                promptTokens: usage.inputTokens ?? 0,
                completionTokens: usage.outputTokens ?? 0,
                totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
              },
            }
          ]);

          // Update conversation updatedAt timestamp for sorting
          await db.update(aiConversations)
            .set({ updatedAt: new Date() })
            .where(eq(aiConversations.id, conversationId));
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
