import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { aiConversations, aiMessages } from "@/lib/db/schema/ai";
import { retrieveContext } from "@/lib/ai/retriever";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { messages, workspaceId, conversationId, contextScope } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

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
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      onFinish: async ({ text, usage }) => {
        // Save conversation and messages to DB
        // (Simplified for brevity: saving to existing conversation)
        if (conversationId) {
          await db.insert(aiMessages).values([
            {
              conversationId: conversationId,
              role: "user",
              content: lastMessage,
              tokenUsage: { promptTokens: usage.inputTokens, completionTokens: 0 },
            },
            {
              conversationId: conversationId,
              role: "assistant",
              content: text,
              citations: contextResults.map(r => ({ docId: r.docId, title: r.docTitle })),
              tokenUsage: { promptTokens: 0, completionTokens: usage.outputTokens },
            }
          ]);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
