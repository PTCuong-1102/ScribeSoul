import { streamText, DefaultChatTransport } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, context } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `Bạn là Soul Assistant, một trợ lý viết lách chuyên nghiệp cho tiểu thuyết gia.
Yêu cầu: Gợi ý văn bản tiếp theo dựa trên bối cảnh được cung cấp.
Phong cách: Giữ định mức văn phong của tác giả (trang trọng, lãng mạn, hoặc u tối).
Giới hạn: Chỉ trả về đoạn văn bản gợi ý tiếp theo (khoảng 1-2 câu), không thêm lời giải thích.`,
    prompt: `Bối cảnh câu chuyện:\n${context}\n\nĐoạn văn cuối cùng: ${prompt}\n\nViết tiếp:`,
  });

  return result.toTextStreamResponse();
}
