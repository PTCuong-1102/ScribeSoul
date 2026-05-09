# 🖋️ ScribeSoul — Phân tích dự án chi tiết

> **Thời điểm phân tích:** 2026-05-09  
> **Người phân tích:** Antigravity (Claude Sonnet 4.6 Thinking)

---

## 1. Tổng quan dự án

**ScribeSoul** là một nền tảng viết sáng tạo tích hợp AI, được xây dựng cho nhà văn. Dự án có ba trụ cột:

| Trụ cột | Mô tả | Trạng thái |
|---|---|---|
| Deep Work Editor | Block-based editor (BlockNote) | ✅ Đã triển khai |
| Semantic Knowledge Base | RAG với pgvector | ⚠️ Một phần hoàn thiện |
| Context-Aware AI | Soul Assistant chat, autocomplete | ✅ Đã triển khai |

### Stack kỹ thuật
- **Framework:** Next.js 16 (App Router) + React 19
- **DB:** Neon PostgreSQL + pgvector + Drizzle ORM
- **AI:** Vercel AI SDK v6 + OpenAI (gpt-4o, text-embedding-3-small)
- **Auth:** NextAuth.js v5
- **UI:** TailwindCSS v4 + shadcn/ui + BlockNote + Mantine

---

## 2. Kiến trúc & luồng dữ liệu

```
User → Next.js App Router
         ├── Server Components (page.tsx) → Server Actions (src/server/actions/)
         └── Client Components ("use client")
               ├── BlockEditor → fetch("/api/sync") → PostgreSQL (blocks table)
               ├── AI autocomplete → fetch("/api/ai/autocomplete")
               ├── Chat → fetch("/api/chat") → RAG → OpenAI stream
               └── CommandSearch → semanticSearch() Server Action → pgvector
```

### Luồng RAG (Retrieval-Augmented Generation)
```
Document save → /api/sync (blocks) → [thủ công] /api/ingest
                                          ↓
                            chunkBlocks() → generateEmbeddings()
                                          ↓
                              document_chunk + chunk_embedding tables
                                          ↓
              Chat query → generateEmbedding(query) → pgvector cosine search
                        → top-5 context chunks → system prompt → OpenAI stream
```

### Database schema tóm tắt
```
users (id, email, plan)
  └── workspaces (id, ownerId, name, settings)
        └── documents (id, workspaceId, parentId, title, type, status, metadata)
              └── blocks (id, documentId, type, content, sortOrder, parentBlockId)
              └── document_chunk (id, documentId, blockId, content, metadata)
                    └── chunk_embedding (id, chunkId, embedding vector(1536))
              
users ──── ai_conversation (id, userId, workspaceId, contextType)
              └── ai_message (id, conversationId, role, content, citations, tokenUsage)

documents ←→ document_link (sourceId, targetId, type) [backlinks]
```

---

## 2. Những điểm mạnh đáng ghi nhận

### ✅ Kiến trúc tốt
- **Phân tách rõ ràng:** `src/server/actions/` cho server-side logic, `src/lib/` cho utilities tái sử dụng — đúng chuẩn Next.js App Router.
- **Zod validation nhất quán:** Tất cả server actions và API routes đều dùng Zod để validate input đầu vào.
- **Custom error classes:** `src/lib/errors.ts` định nghĩa đầy đủ AppError, ValidationError, AuthError... có hệ thống.
- **Rate limiting với Upstash:** `checkRateLimit()` được áp dụng tại `/api/chat` — bảo vệ chi phí API.
- **Env validation tại startup:** `src/lib/env.ts` validate toàn bộ biến môi trường bằng Zod và fail-fast nếu thiếu.
- **Database relations:** Drizzle relations được khai báo đầy đủ trong `schema/index.ts`.
- **Cascade delete:** Các foreign key đều có `onDelete: "cascade"` phù hợp.
- **Ingest dùng transaction:** `/api/ingest` xóa chunks cũ và insert mới trong cùng một transaction — đảm bảo tính nhất quán.

### ✅ UX Design
- Force-directed graph (KnowledgeWeb) tự implement bằng SVG + requestAnimationFrame — không phụ thuộc thêm library.
- Editor có slash menu với AI items (Soul Write, Soul Refine) — UX tốt, gần với Notion.
- Debounce auto-save 1 giây trong `BlockEditor` — hạn chế request thừa.
- Sync status indicator (idle → saving → saved → error) — UX rõ ràng.
- Floating toolbar trong document view — thiết kế hiện đại.

---

## 3. Các lỗi & vấn đề nghiêm trọng (Bugs)

### 🔴 BUG 1: Ingest KHÔNG tự động chạy sau khi lưu (RAG bị phá vỡ)

**File:** `src/lib/ingest-trigger.ts` và `src/components/editor/BlockEditor.tsx`

`queueDocumentIngest()` chỉ là một hàm **giả** — nó log ra console và return `true`, không thực sự làm gì:

```typescript
// src/lib/ingest-trigger.ts (dòng 27-31)
// In production, this should use a job queue (Bull, Inngest, etc)
// For now, we'll just log and return true
console.log(`[INGEST] Queued document for ingestion: ${documentId}`)
return true
```

`BlockEditor.tsx` sau khi save vào `/api/sync` **không gọi** `/api/ingest`. Kết quả: embeddings **không bao giờ được cập nhật** sau khi người dùng chỉnh sửa tài liệu. RAG hoạt động dựa trên dữ liệu cũ (hoặc trống rỗng nếu chưa ingest lần nào). **Đây là lỗi nghiêm trọng nhất — tính năng cốt lõi không hoạt động đúng.**

**Cách fix đơn giản:** Thêm một `fetch('/api/ingest', ...)` sau mỗi lần sync thành công (có thể debounce riêng, ví dụ 5 giây).

---

### 🔴 BUG 2: `getDocument()` kiểm tra ownership SAU khi đọc dữ liệu

**File:** `src/server/actions/documents.ts` (dòng 87-100)

```typescript
export async function getDocument(id: string) {
  const doc = await db.query.documents.findFirst({ ... }) // ← đọc DB trước
  if (!doc) throw new Error("Document không tồn tại")
  await checkWorkspaceOwnership(doc.workspaceId)          // ← check auth sau
  return doc
}
```

Thứ tự đúng phải là: xác thực session trước, rồi mới query. Hiện tại, bất kỳ user nào có document ID hợp lệ đều có thể trigger một DB query, sau đó mới bị từ chối. Đây là **IDOR (Insecure Direct Object Reference) nhẹ** — không lộ data thực sự vì cuối cùng vẫn check auth, nhưng lãng phí DB call và là pattern nguy hiểm.

---

### 🔴 BUG 3: `moveDocument()` không kiểm tra circular reference sâu hơn

**File:** `src/server/actions/documents.ts` (dòng 259-293)

Chỉ kiểm tra `newParentId === documentId` (1 cấp). Không kiểm tra trường hợp: nếu `documentId` là tổ tiên của `newParentId`, sẽ tạo ra vòng lặp vô hạn trong tree. Ví dụ: A → B → C, nếu move A vào C → C.parentId = A → A.parentId = C.parentId = A... (cycle).

---

### 🔴 BUG 4: `/api/sync` không đồng bộ blockId với BlockNote

**File:** `src/components/editor/BlockEditor.tsx` (dòng 186-202)

```typescript
const flatBlocks = editor.document.map((b: any, idx: number) => ({
  id: b.id,          // BlockNote tự sinh ID (string UUID)
  type: b.type,
  content: b.content,
  parentBlockId: null, // Hard-code null → nested blocks bị phẳng hóa
  sortOrder: idx,
}))

await fetch('/api/sync', {
  body: JSON.stringify({ documentId, upsert: flatBlocks, deletions: [] }) // deletions luôn là []
})
```

**Hai vấn đề:**
1. **`deletions` luôn là `[]`**: Khi user xóa một block trong editor, block đó không bao giờ bị xóa khỏi DB. DB ngày càng tích lũy "block rác".
2. **`parentBlockId` luôn là `null`**: Nested blocks bị flat hóa, mất cấu trúc phân cấp.

---

### 🔴 BUG 5: `retrieveContext()` — SQL injection vector

**File:** `src/lib/ai/retriever.ts` (dòng 28-45)

```typescript
const vectorStr = `[${queryEmbedding.join(',')}]`
// ...
1 - (ce.embedding <=> ${vectorStr}::vector) as similarity
```

`vectorStr` được nội suy trực tiếp vào SQL template. Mặc dù `queryEmbedding` là một mảng số từ OpenAI nên thực tế ít rủi ro, nhưng đây là pattern nguy hiểm vì không dùng parameterized query. Nếu format của embedding thay đổi hoặc có bug trong embedder, có thể dẫn đến SQL syntax error hoặc tệ hơn.

---

### 🟡 BUG 6: `scope?.documentIds` trong SQL query bị broken

**File:** `src/lib/ai/retriever.ts` (dòng 42)

```typescript
${scope?.documentIds ? sql` AND ${documents.id} IN ${scope.documentIds}` : sql``}
```

`scope.documentIds` là một `string[]`, nhưng Drizzle `sql` template không tự convert array thành SQL list `('a', 'b', 'c')`. Đây sẽ gây lỗi runtime nếu `scope.documentIds` được truyền vào. Feature này hiện không được dùng đến nên chưa bị phát hiện.

---

### 🟡 BUG 7: `KnowledgeWeb` — force simulation chạy mãi mãi, không dừng

**File:** `src/components/dashboard/KnowledgeWeb.tsx` (dòng 53-98)

`requestAnimationFrame` loop chạy liên tục (mỗi ~16ms) và gọi `setNodes()` → re-render toàn bộ component mỗi frame. Không có điều kiện dừng (kiểm tra khi lực hội tụ). Trên workspace có nhiều node, component này sẽ **liên tục re-render và tốn CPU** ngay cả khi graph đã ổn định.

---

### 🟡 BUG 8: `getProductivityStats()` tính từ `updatedAt` của block — không chính xác

**File:** `src/server/actions/documents.ts` (dòng 222-228)

```typescript
const dayKey = toLocalDayKey(new Date(block.updatedAt))
dayWords.set(dayKey, (dayWords.get(dayKey) ?? 0) + words)
```

Đếm **tổng số từ** trong tất cả blocks được cập nhật hôm nay, không phải số từ **viết thêm** hôm nay. Nếu user edit 1 từ trong block 500 chữ → block đó được tính là viết 500 từ hôm nay. Không phản ánh thực tế.

---

### 🟡 BUG 9: `/api/sync` N+1 Query problem

**File:** `src/app/api/sync/route.ts` (dòng 51-92)

Với mỗi block trong `upsert` array, chạy: 1 SELECT (check exist) + 1 UPDATE hoặc INSERT = `2N` database calls trong một transaction. Với document dài 100 blocks → 200 DB calls mỗi lần save. Cần dùng `INSERT ... ON CONFLICT DO UPDATE` (upsert thực sự).

---

### 🟡 BUG 10: `BlockEditor` — stream response từ AI không được parse đúng

**File:** `src/components/editor/BlockEditor.tsx` (dòng 99-113)

```typescript
const chunk = decoder.decode(value)
fullText += chunk
editor.updateBlock(newBlock, {
  type: "paragraph",
  content: fullText,  // ← raw text string, không phải InlineContent[]
})
```

BlockNote's `content` field cho paragraph là `InlineContent[]`, không phải raw string. Việc truyền raw string vào có thể gây lỗi hoặc không hiển thị đúng, đặc biệt khi response chứa ký tự đặc biệt.

---

## 4. Điểm cần cải thiện (Non-critical)

### 💡 Cải thiện 1: Tự động ingest sau khi lưu

Sau khi `/api/sync` thành công, trigger `/api/ingest` (debounce 5s) để embeddings luôn cập nhật. Hoặc dùng Vercel Background Functions / Inngest.

### 💡 Cải thiện 2: Xây dựng Vector Index cho pgvector

Chưa thấy migration tạo HNSW/IVFFlat index trên `chunk_embedding.embedding`. Không có index → full table scan mỗi query → O(n) performance:

```sql
CREATE INDEX ON chunk_embedding USING hnsw (embedding vector_cosine_ops);
```

### 💡 Cải thiện 3: `chunkBlocks()` — token estimation quá thô

```typescript
const getCharLimit = () => maxTokens * 4  // "4 chars per token"
```

Dùng tiktoken hoặc ít nhất là heuristic tốt hơn (tiếng Việt thường có tỷ lệ chars/token khác tiếng Anh). Chunks không đồng đều có thể ảnh hưởng chất lượng retrieval.

### 💡 Cải thiện 4: `aiMessages` lưu `tokenUsage` không nhất quán

```typescript
// User message:
tokenUsage: { promptTokens: usage.inputTokens, completionTokens: 0 }
// Assistant message:
tokenUsage: { promptTokens: 0, completionTokens: usage.outputTokens }
```

Không thể biết tổng token usage của một conversation. Nên lưu full usage (`promptTokens`, `completionTokens`, `totalTokens`) chỉ trong một record (assistant message).

### 💡 Cải thiện 5: Dashboard page không navigate được từ card

**File:** `src/app/workspace/[workspaceId]/page.tsx` (dòng 70-91)

Card "Bản thảo gần đây" có `cursor-pointer` nhưng không có `onClick` hoặc là `<Link>`. Click vào không làm gì cả. Cần thêm `<Link href={...}>` bọc ngoài card.

### 💡 Cải thiện 6: Button "Chương mới" và "Tìm kiếm bối cảnh" trên dashboard không hoạt động

**File:** `src/app/workspace/[workspaceId]/page.tsx` (dòng 36-49)

Cả hai `<Button>` không có `onClick` handler. Cần kết nối với `createDocument()` và CommandSearch.

### 💡 Cải thiện 7: `semanticSearch()` trả về empty array khi lỗi — khó debug

```typescript
} catch (error) {
  console.error("Semantic search error:", error)
  return []  // Silent failure
}
```

Nên phân biệt: lỗi kết nối DB vs. không có kết quả thực sự. Trả về empty array trong cả hai trường hợp khiến UI không thể phân biệt "không tìm thấy" với "lỗi hệ thống".

### 💡 Cải thiện 8: `Sidebar` gọi Server Action từ `useEffect` — anti-pattern

**File:** `src/components/layout/Sidebar.tsx` (dòng 29-35)

Gọi `getRecentDocuments()` (Server Action) trực tiếp từ `useEffect` trong client component. Server Actions được tối ưu cho form submissions/mutations. Nên tạo một API route GET để fetch recent docs, hoặc dùng SWR/React Query.

### 💡 Cải thiện 9: Không có loading skeleton cho document pages

Khi load `/workspace/[id]/documents/[docId]`, không có skeleton UI → người dùng thấy trang trắng trong khi chờ.

### 💡 Cải thiện 10: `workspaces.ts` schema thiếu index

**File:** `src/lib/db/schema/workspaces.ts`

Bảng `workspaces` thiếu index trên `ownerId` — mỗi `listWorkspaces()` và `checkWorkspaceOwnership()` là full table scan. Cần thêm:

```typescript
ownerIdx: index("workspace_owner_idx").on(table.ownerId)
```

---

## 5. Vấn đề bảo mật

| Mức độ | Vấn đề | File |
|---|---|---|
| 🔴 Cao | SQL string interpolation cho vector query | `lib/ai/retriever.ts:28` |
| 🟡 Trung bình | `getDocument()` check auth sau query (IDOR pattern) | `server/actions/documents.ts:87` |
| 🟡 Trung bình | `ingest-trigger.ts` dùng hardcoded URL fallback | `lib/ingest-trigger.ts:43` |
| 🟢 Thấp | `moveDocument()` chỉ check circular 1 cấp | `server/actions/documents.ts:268` |

---

## 6. Tính năng theo Roadmap — Trạng thái thực tế

| Tính năng (README) | Trạng thái thực tế |
|---|---|
| Block-based editor (BlockNote) | ✅ Hoàn chỉnh |
| Auto-save | ✅ Có (debounce 1s), nhưng deletions bị bỏ sót |
| AI autocomplete (Soul Write/Refine) | ✅ Có endpoint, nhưng response parsing sai format |
| RAG / Semantic Search | ⚠️ Có infrastructure nhưng ingest không tự động |
| Command Palette (Cmd+K) | ✅ Có CommandSearch component |
| Knowledge Graph visualization | ⚠️ Có SVG force-directed nhưng chạy liên tục tốn CPU |
| Backlinks | ⚠️ Có schema và action nhưng UI chưa tích hợp đầy đủ |
| Nested documents | ⚠️ Schema có nhưng parentId bị flat trong sync |
| Document types (character, setting, plot) | ✅ Có schema và routes |
| Productivity stats | ⚠️ Có nhưng logic đếm từ không chính xác |
| Real-time multiplayer | ❌ Chưa implement (Roadmap giai đoạn 3) |
| Mobile PWA | ❌ Chưa implement (Roadmap giai đoạn 4) |

---

## 7. Tóm tắt ưu tiên sửa lỗi

### Ưu tiên cao (ảnh hưởng tính năng cốt lõi)
1. **BUG 1** — Trigger ingest sau khi save block
2. **BUG 4** — Fix deletions trong `/api/sync` + restore nested block support
3. **BUG 5** — Dùng parameterized query cho pgvector
4. **Cải thiện 2** — Tạo pgvector HNSW index
5. **Cải thiện 5 & 6** — Fix các button/card không có handler trên dashboard

### Ưu tiên trung bình
6. **BUG 9** — Thay N+1 upsert bằng bulk upsert
7. **BUG 7** — Dừng force simulation khi graph ổn định
8. **BUG 2** — Check auth trước khi query DB
9. **BUG 3** — Deep circular reference detection cho moveDocument
10. **BUG 10** — Streaming response phải convert sang InlineContent[]

### Ưu tiên thấp (cải thiện chất lượng)
11. **BUG 8** — Cải thiện logic đếm từ productivity
12. **Cải thiện 3** — Token estimation tốt hơn cho chunker
13. **Cải thiện 10** — Index `workspaces.ownerId`
14. **Cải thiện 4** — Normalize tokenUsage trong aiMessages
15. **Cải thiện 8** — Refactor sidebar data fetching
