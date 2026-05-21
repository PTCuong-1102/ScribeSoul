import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/lib/auth/server";
import { AI_CONFIG } from "@/lib/ai/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "edge";

const autocompleteSchema = z.object({
  prompt: z.string().max(2000, "Prompt too long"),
  context: z.string().max(10000, "Context too long"),
  mode: z.enum(["continue", "refine"]).optional(),
});

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const result = autocompleteSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { prompt, context, mode = "continue" } = result.data;

    // Rate Limit Check (60 requests per minute)
    const rateLimitKey = `autocomplete:${session.user.id}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 60, "1 m");
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Too many autocomplete requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: new Date(rateLimitResult.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      );
    }

    const isRefineMode = mode === "refine";

    const systemPrompt = isRefineMode
      ? `Bạn là Soul Assistant, biên tập viên văn học cho tiểu thuyết gia.
Yêu cầu: Viết lại đoạn văn theo phong cách mượt mà, rõ nhịp điệu và giữ nguyên ý chính.
Giới hạn: Chỉ trả về đoạn văn đã tinh chỉnh, không thêm giải thích.`
      : `Bạn là Soul Assistant, một trợ lý viết lách chuyên nghiệp cho tiểu thuyết gia.
Yêu cầu: Gợi ý văn bản tiếp theo dựa trên bối cảnh được cung cấp.
Phong cách: Giữ định mức văn phong của tác giả (trang trọng, lãng mạn, hoặc u tối).
Giới hạn: Chỉ trả về đoạn văn bản gợi ý tiếp theo (khoảng 1-2 câu), không thêm lời giải thích.`;

    const userPrompt = isRefineMode
      ? `Bối cảnh câu chuyện:\n${context}\n\nĐoạn văn cần tinh chỉnh: ${prompt}\n\nViết lại đoạn văn này:`
      : `Bối cảnh câu chuyện:\n${context}\n\nĐoạn văn cuối cùng: ${prompt}\n\nViết tiếp:`;

    const aiResult = await streamText({
      model: openai(AI_CONFIG.autocompleteModel),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return aiResult.toTextStreamResponse();
  } catch (error) {
    console.error("[AUTOCOMPLETE_ERROR]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
