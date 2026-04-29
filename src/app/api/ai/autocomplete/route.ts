import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/lib/auth/server";
import { AI_CONFIG } from "@/lib/ai/config";

export const runtime = "edge";

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { prompt, context, mode = "continue" } = await req.json();
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

  const result = await streamText({
    model: openai(AI_CONFIG.autocompleteModel),
    system: systemPrompt,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse();
}
