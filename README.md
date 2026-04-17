# ScribeSoul

Nền tảng viết sáng tạo tích hợp AI, hướng tới trải nghiệm viết sâu, quản lý tri thức theo mô hình block-based và truy xuất ngữ cảnh bằng semantic search.

## Mục tiêu dự án

ScribeSoul tập trung vào 3 năng lực chính:
- **Viết tập trung** với editor dạng block (Notion-like).
- **Quản trị tri thức** qua workspace, document tree, backlinks và knowledge graph.
- **Hỗ trợ AI theo ngữ cảnh** bằng pipeline chunking → embedding → retrieval (RAG).

## Trạng thái hiện tại

Dự án đang ở giai đoạn **MVP đang phát triển**, đã có:
- Khung giao diện đầy đủ cho landing, auth, dashboard, editor và AI chat.
- CRUD Server Actions cho workspace/document/link/settings.
- API routes cho sync blocks, ingest dữ liệu và chat streaming.
- Schema Drizzle cho Neon PostgreSQL + pgvector.

Một số phần vẫn mang tính nền tảng (đang hoàn thiện dần), ví dụ: provider auth thực tế, graph links động, và một số logic AI nâng cao.

---

## Kiến trúc tổng quan

- **Frontend**: Next.js App Router, React 19, Tailwind CSS 4, shadcn/ui, BlockNote.
- **Backend**: Next.js Server Actions + Route Handlers.
- **Auth**: NextAuth v5 + Drizzle Adapter.
- **Database**: Neon PostgreSQL + Drizzle ORM + `pgvector`.
- **AI**: Vercel AI SDK + OpenAI models (chat + embedding).
- **CI/CD**: GitHub Actions (lint, type check, build, migrate).

## Công nghệ sử dụng

- `next@16`, `react@19`, `typescript@5`
- `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
- `next-auth@5 beta`, `@auth/drizzle-adapter`
- `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
- `@blocknote/*`, `@mantine/*`
- `tailwindcss@4`, `eslint@9`

---

## Cấu trúc thư mục chính

```text
src/
├─ app/
│  ├─ (auth)/
│  ├─ (workspace)/
│  └─ api/
├─ components/
│  ├─ ai/
│  ├─ dashboard/
│  ├─ editor/
│  ├─ layout/
│  ├─ search/
│  └─ ui/
├─ lib/
│  ├─ ai/
│  └─ db/
├─ server/
│  └─ actions/
└─ auth.ts

.doc/      # Tài liệu phân tích, tech spec, schema, API spec
.design/   # Thiết kế giao diện và mockup
```

---

## Tính năng nổi bật (MVP)

### 1) Workspace & Document Management
- Tạo/sửa/xóa workspace.
- Tạo/sửa/xóa document theo loại (`doc`, `character`, `setting`, `plot`).
- Cấu trúc document tree và tìm kiếm theo tiêu đề.

### 2) Block Editor & Đồng bộ nội dung
- Editor block-based với BlockNote.
- API `/api/sync` để upsert/delete block theo document.
- Hỗ trợ import/export Markdown cơ bản qua Server Actions.

### 3) AI Assistant & RAG nền tảng
- `/api/ingest`: chunk nội dung và tạo embeddings.
- `/api/chat`: truy xuất context liên quan và stream câu trả lời AI.
- Semantic search cho Command Palette.

### 4) Liên kết tri thức
- Schema và actions cho `document_link` (backlinks).
- Knowledge Web trực quan hóa node theo document trong workspace.

---

## Yêu cầu môi trường

- Node.js **20+**
- npm **10+**
- PostgreSQL (khuyến nghị Neon) có extension `vector`

## Biến môi trường

Tạo file `.env.local`:

```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
NEXTAUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

> Ghi chú: Trong code hiện tại, `DATABASE_URL` là biến bắt buộc trực tiếp cho DB. Các biến auth/provider nên cấu hình để sẵn sàng cho triển khai auth đầy đủ.

---

## Chạy dự án local

```bash
npm ci --legacy-peer-deps
npm run dev
```

Mở: `http://localhost:3000`

## Scripts quan trọng

```bash
npm run dev      # Chạy local
npm run lint     # ESLint
npm run build    # Build production
npm run start    # Run bản build
npx tsc --noEmit # Type check (theo CI)
```

## Database & Drizzle

```bash
# Enable extension vector (tham khảo src/lib/db/setup.ts)
# CREATE EXTENSION IF NOT EXISTS vector;

# Cấu hình drizzle tại drizzle.config.ts
npx drizzle-kit generate
npx drizzle-kit push
```

---

## CI/CD

Workflow tại `.github/workflows/ci-cd.yml` gồm:
1. **Quality**: cài dependencies, chạy lint + type check.
2. **Build**: build Next.js production.
3. **Deploy Preview**: thông báo sẵn sàng deploy trên PR.
4. **Migrate**: push schema Drizzle khi merge `main` (nếu có `DATABASE_URL`).

---

## Tài liệu nội bộ

- `/.doc/01_ScribeSoul_Project_Plan.md`
- `/.doc/02_ScribeSoul_Technical_Spec.md`
- `/.doc/03_ScribeSoul_Database_Schema.md`
- `/.doc/04_ScribeSoul_API_Spec.md`
- `/DESIGN.md` và thư mục `/.design/`

---

## Đóng góp

1. Tạo branch từ `main`.
2. Commit theo thay đổi nhỏ, rõ ràng.
3. Đảm bảo `npm run lint` pass.
4. Tạo PR kèm mô tả phạm vi thay đổi.

---

## Định hướng mở rộng

- Hoàn thiện auth providers và flow đăng nhập thực tế.
- Nâng cấp parser Markdown/BlockNote hai chiều.
- Mở rộng knowledge graph với edges thực từ `document_link`.
- Thêm cache/rate-limit nâng cao cho AI API.
- Bổ sung test tự động cho actions và API routes.
