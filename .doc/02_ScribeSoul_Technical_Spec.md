```markdown

\\# ⚙️ ScribeSoul - Technical Specification (Next.js + NeonDB)



\\## 🧱 Tech Stack

| Layer | Công nghệ | Ghi chú |

|-------|-----------|---------|

| Frontend | Next.js 14/15 (App Router), React 18, Tailwind, shadcn/ui | Server Components + Client Islands |

| Editor | `@blocknote/core` + `@blocknote/react` | JSON-based, Notion-like, custom AI node |

| Auth | `auth.js` (NextAuth v5) + NeonDB adapter | Hỗ trợ Email, Google, GitHub, Magic Link |

| Backend | Next.js Server Actions + Route Handlers | `use server`, streaming, rate limiting |

| Database | NeonDB (PostgreSQL 16) + `pgvector` + `drizzle-orm` | Connection pooling, RLS enabled |

| AI | OpenAI/Anthropic via OpenRouter, `@langchain/core`, `pgvector` | RAG, streaming, citation extraction |

| Infra | Vercel (App), Neon (DB), Upstash (Redis cache), Sentry (monitor) | CI/CD GitHub Actions, Preview branches |



\\## 🏗️ Kiến trúc tổng thể

```

\[Client] Next.js App Router (Server/Client Components)

&#x20;  ↓ (Server Actions / API Routes)

\[Next.js Server] Edge Runtime (middleware) + Node.js (AI/DB heavy)

&#x20;  ↓ (Drizzle ORM + pg)

\[NeonDB] PostgreSQL + pgvector + RLS policies

&#x20;  ↓ (Vector search + AI prompts)

\[AI Layer] LLM API → Prompt Router → RAG Retriever → Streaming Response

&#x20;  ↓ (Cache)

\[Upstash Redis] Rate limit, AI response cache, session lock

```



\\## 📦 Cấu trúc thư mục (Next.js App Router)

```

src/

├─ app/

│  ├─ (auth)/login, register, callback/

│  ├─ (workspace)/\[workspaceId]/

│  │  ├─ documents/\[docId]/page.tsx

│  │  ├─ chat/page.tsx

│  │  └─ settings/page.tsx

│  ├─ api/

│  │  ├─ chat/route.ts          # Streaming AI

│  │  ├─ sync/route.ts          # Block save, conflict resolution

│  │  └─ ingest/route.ts        # Chunk \& embed pipeline

│  └─ layout.tsx, page.tsx

├─ components/

│  ├─ editor/BlockEditor.tsx    # BlockNote wrapper

│  ├─ ai/ChatInterface.tsx

│  └─ ui/ (shadcn)

├─ lib/

│  ├─ db/ (drizzle schema, queries)

│  ├─ ai/ (rag.ts, prompts.ts, cache.ts)

│  ├─ auth/ (auth.config.ts, adapter.ts)

│  └─ utils/

├─ server/

│  ├─ actions/ (saveBlocks, createLink, askAI)

│  └─ middleware/ (auth, rateLimit, cors)

└─ styles/

```



\\## 🔐 Auth \\\& Security

\\- \\\*\\\*Auth.js v5\\\*\\\*: Dùng `DrizzleAdapter` kết nối NeonDB. Session JWT + DB sync.

\\- \\\*\\\*Row Level Security (RLS)\\\*\\\*: Bật trên mọi bảng. Policy: `user\\\_id = current\\\_user\\\_id()` hoặc `workspace\\\_id IN (allowed)`.

\\- \\\*\\\*Rate Limiting\\\*\\\*: `@upstash/ratelimit` trên `/api/chat`, `/api/ingest`.

\\- \\\*\\\*Data Privacy\\\*\\\*: Không lưu raw prompt/output quá 30 ngày. Tắt telemetry AI trên plan Free.



\\## 🤖 AI Integration (MVP)

1\\. \\\*\\\*Ingestion\\\*\\\*: Khi block/document save → Server Action gọi `ingest`

2\\. \\\*\\\*Chunking\\\*\\\*: Theo ngữ cảnh (max 600 tokens, overlap 100). Meta `doc\\\_id, block\\\_id, type, char\\\_name, setting`

3\\. \\\*\\\*Embedding\\\*\\\*: `text-embedding-3-small` → lưu vào `pgvector`

4\\. \\\*\\\*Retrieval\\\*\\\*: Hybrid search (vector + metadata filter). Top-K=5

5\\. \\\*\\\*Generation\\\*\\\*: Prompt system + retrieved chunks → `streamText` (AI SDK)

6\\. \\\*\\\*Citation\\\*\\\*: Parse `\\\[\\\[citation\\\_id]]` → highlight trong editor

7\\. \\\*\\\*Fallback\\\*\\\*: Nếu API timeout → chuyển model nhỏ hoặc cache response



\\## 📡 State \\\& Data Flow

\\- \\\*\\\*Optimistic UI\\\*\\\*: Client cập nhật block ngay → Server Action xác nhận

\\- \\\*\\\*Sync\\\*\\\*: Debounce 1s, queue nếu offline, retry 3 lần

\\- \\\*\\\*Editor State\\\*\\\*: JSON từ BlockNote → `JSONB` trong DB

\\- \\\*\\\*Realtime\\\*\\\*: MVP dùng polling 30s. Phase 2 nâng cấp `WebSocket`/`Supabase Realtime`



\\## 🚀 Deployment \\\& CI/CD

\\- \\\*\\\*Dev\\\*\\\*: `vercel dev` + Neon staging branch

\\- \\\*\\\*Prod\\\*\\\*: `vercel --prod` + Neon primary pooler

\\- \\\*\\\*Migrations\\\*\\\*: `drizzle-kit generate` + `migrate` trong GitHub Action

\\- \\\*\\\*Monitor\\\*\\\*: Sentry (frontend/backend), Upstash logs, Neon query insights

```



\---



