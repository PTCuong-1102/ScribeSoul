# 🏗️ ScribeSoul — Implementation Plan

## Goal

Xây dựng ScribeSoul MVP — nền tảng viết sáng tạo tích hợp AI dành cho nhà văn — trong 10 tuần, dựa trên toàn bộ documentation đã có:

- [01_Project_Plan.md](file:///d:/Project/ScribeSoul/.doc/01_ScribeSoul_Project_Plan.md) — Lộ trình & KPIs
- [02_Technical_Spec.md](file:///d:/Project/ScribeSoul/.doc/02_ScribeSoul_Technical_Spec.md) — Kiến trúc & Tech Stack
- [03_Database_Schema.md](file:///d:/Project/ScribeSoul/.doc/03_ScribeSoul_Database_Schema.md) — Full DB Schema
- [04_API_Spec.md](file:///d:/Project/ScribeSoul/.doc/04_ScribeSoul_API_Spec.md) — 43 API Endpoints
- [DESIGN.md](file:///d:/Project/ScribeSoul/DESIGN.md) — Design System (Light/Dark)

---

## User Review Required

> [!IMPORTANT]
> **Tech Stack Confirmation**: Plan sử dụng Next.js 15 (App Router), React 18, Tailwind CSS, shadcn/ui, BlockNote.js, Drizzle ORM, NeonDB, Auth.js v5, Upstash Redis, OpenRouter AI. Xác nhận nếu muốn thay đổi bất kỳ technology nào.

> [!WARNING]
> **Environment Variables**: Plan yêu cầu các API keys/credentials sau trước khi bắt đầu Phase 3:
> - NeonDB connection string
> - Auth.js secret + OAuth credentials (Google, GitHub)
> - OpenRouter API key (hoặc OpenAI/Anthropic direct)
> - Upstash Redis URL + token
>
> Phase 1-2 có thể chạy với local/mock data.

> [!IMPORTANT]
> **Scope Decision**: Plan tập trung vào **core writing experience + AI chat**. Các tính năng sau được **defer sang post-MVP**:
> - Real-time collaboration (WebSocket)
> - Stripe payment integration
> - Mobile-responsive (sẽ design desktop-first)
> - Character Roleplay (Phase 2 enhancement)

---

## Proposed Changes

### Phase 0: Project Initialization (Day 1)

> Khởi tạo Next.js project, cài dependencies, cấu hình tooling.

#### [NEW] Project scaffold

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

#### [NEW] Dependencies to install

```bash
# UI & Components
npm install @blocknote/core @blocknote/react @blocknote/mantine
npx shadcn@latest init

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# AI
npm install ai @ai-sdk/openai openai

# Utilities
npm install zod uuid
npm install -D @types/uuid

# Rate Limiting & Cache
npm install @upstash/ratelimit @upstash/redis
```

#### [NEW] Config files to create

| File | Purpose |
|------|---------|
| `drizzle.config.ts` | Drizzle Kit configuration |
| `src/lib/db/index.ts` | NeonDB connection (pooler) |
| `src/auth.ts` + `src/auth.config.ts` | Auth.js v5 setup |
| `.env.local` | Environment variables template |
| `src/styles/globals.css` | Design tokens (CSS custom properties) |
| `tailwind.config.ts` | Extended with ScribeSoul design tokens |

---

### Phase 1: Foundation & UI Core (Tuần 1-2)

> Setup auth, database schema, layout system, và editor cơ bản.
> **Acceptance**: Đăng nhập được, tạo workspace, editor render JSON block.

---

#### Component 1.1: Design System & Global Styles

##### [NEW] src/styles/globals.css
- CSS custom properties cho **cả Light và Dark theme**
- Light: Surface hierarchy (`#fbf9f4`, `#f5f3ee`, `#ffffff`, `#eae8e3`)
- Dark: Deep Space hierarchy (`#0b1326`, `#131b2e`, `#171f33`, `#2d3449`)
- AI accent: Violet Glow (`#7C3AED`, `#712ae2`, `#8a4cfc`)
- Typography: Import Google Fonts (Newsreader + Inter)
- No-Line Rule enforcement: no default borders
- Glassmorphism utilities

##### [MODIFY] tailwind.config.ts
- Extend colors with design tokens (surface, on-surface, primary, secondary, etc.)
- Extend fontFamily: `serif: ['Newsreader', 'Georgia']`, `sans: ['Inter', 'system-ui']`
- Extend borderRadius with scale (sm, md, lg, xl, 2xl, full)
- Extend spacing with 80px, 120px for editorial margins
- Dark mode: `class` strategy

##### [NEW] src/components/ui/ (shadcn components)
- Install: `button`, `input`, `dialog`, `dropdown-menu`, `tooltip`, `avatar`, `badge`, `separator`, `scroll-area`, `sheet`, `tabs`, `command`
- Override shadcn theme to match ScribeSoul design tokens

---

#### Component 1.2: Database Schema (Drizzle)

##### [NEW] src/lib/db/schema/users.ts
- `users` table: id (UUID v7), email, name, avatar_url, plan, timestamps
- `accounts` table: Auth.js adapter schema
- `sessions` table: Auth.js adapter schema
- `verificationTokens` table: for Magic Link

##### [NEW] src/lib/db/schema/workspaces.ts
- `workspaces` table: id, owner_id (FK users), name, settings (JSONB), timestamps

##### [NEW] src/lib/db/schema/documents.ts
- `documents` table: id, workspace_id (FK), parent_id (self-ref FK), title, type (enum), status, metadata (JSONB), timestamps
- Indexes: workspace_id, parent_id, type

##### [NEW] src/lib/db/schema/blocks.ts
- `blocks` table: id, document_id (FK), type, content (JSONB), sort_order, parent_block_id (self-ref FK), timestamps
- Unique index: `(document_id, sort_order)`

##### [NEW] src/lib/db/schema/links.ts
- `document_links` table: id, source_id (FK docs), target_id (FK docs), type (enum), timestamps
- Unique constraint: `(source_id, target_id)`
- Indexes: source_id, target_id

##### [NEW] src/lib/db/schema/ai.ts
- `document_chunks`: id, document_id, block_id, content (TEXT), metadata (JSONB), token_count, timestamps
- `chunk_embeddings`: id, chunk_id (FK), embedding (VECTOR 1536), timestamps
- HNSW index on embeddings
- `ai_conversations`: id, user_id, workspace_id, title, context_type, timestamps
- `ai_messages`: id, conversation_id, role, content, citations (JSONB), token_usage (JSONB), timestamps

##### [NEW] src/lib/db/index.ts
- NeonDB serverless connection via `@neondatabase/serverless`
- Connection pooler URL
- Drizzle ORM instance export

##### [NEW] src/lib/db/schema/index.ts
- Re-export all schemas
- Relations definitions (Drizzle relations API)

##### [NEW] drizzle.config.ts
- Drizzle Kit config pointing to NeonDB

**Migration**: Run `drizzle-kit generate` → `drizzle-kit migrate` to create all tables.

---

#### Component 1.3: Authentication (Auth.js v5)

##### [NEW] src/auth.ts
- Auth.js v5 configuration
- Providers: Google, GitHub, Email (Magic Link via Resend)
- DrizzleAdapter with NeonDB
- Session strategy: JWT
- Callbacks: session (attach user.id), jwt

##### [NEW] src/auth.config.ts
- Edge-compatible auth config (for middleware)

##### [NEW] src/middleware.ts
- Auth middleware: protect all `/(workspace)/*` routes
- Redirect unauthenticated to `/login`

##### [NEW] src/app/(auth)/login/page.tsx
- Split-screen layout (form left, artwork right)
- Light: Virginia Woolf quote + library image
- Dark: "Welcome, Archivist." + cosmic library
- OAuth buttons (Google, GitHub)
- Magic Link email form
- Newsreader serif for headings, Inter for form labels

##### [NEW] src/app/(auth)/register/page.tsx
- Similar split-screen, "Create your archive" messaging

##### [NEW] src/server/actions/auth.ts
- `getCurrentUser()` Server Action

---

#### Component 1.4: Layout System

##### [NEW] src/app/(workspace)/layout.tsx
- Authenticated layout wrapper
- Sidebar (220px) + Main content area
- Theme toggle (Light/Dark)
- Keyboard shortcuts setup (Cmd+K, Cmd+J)

##### [NEW] src/components/layout/Sidebar.tsx
- Logo "ScribeSoul" / "The Curator"
- Navigation: Chapters, Characters, Locations, Research
- Document tree (recursive)
- "Write New" CTA button
- User profile + Settings + Help links
- Tonal layering background (`surface-container-low`)

##### [NEW] src/components/layout/TopBar.tsx
- Breadcrumb navigation
- Tabs: Drafts, Library, Archive
- Settings & Profile buttons

##### [NEW] src/components/layout/ThemeProvider.tsx
- Dark/Light mode context
- System preference detection
- LocalStorage persistence
- CSS class toggle on `<html>`

---

#### Component 1.5: Dashboard Page

##### [NEW] src/app/(workspace)/[workspaceId]/page.tsx
- "Personal Library / Workspace" heading
- Recent Drafts grid (4 cards with status badges)
- Knowledge Web placeholder (static visualization)
- World Building Snippets row

##### [NEW] src/components/dashboard/DraftCard.tsx
- Document card: title, excerpt (Newsreader italic), status badge, timestamp
- Tonal layering (no borders per No-Line Rule)
- Hover: subtle shadow lift

##### [NEW] src/components/dashboard/KnowledgeWeb.tsx
- Placeholder visualization (static nodes + edges)
- Phase 2: interactive graph with d3/force-graph

---

#### Component 1.6: Basic Editor (BlockNote)

##### [NEW] src/app/(workspace)/[workspaceId]/documents/[docId]/page.tsx
- 3-column layout: Sidebar (reuse) + Editor + AI Drawer placeholder
- Fetch document + blocks via Server Action

##### [NEW] src/components/editor/BlockEditor.tsx
- BlockNote.js integration with React
- Custom theme matching ScribeSoul design tokens
- Newsreader serif for body text (line-height 1.7)
- Slash menu with "Write with AI" section (placeholder)
- Bubble menu on text selection
- Auto-save with debounce (1s)

##### [NEW] src/components/editor/EditorToolbar.tsx
- Minimal floating actions: word count, save status

**Deliverables Tuần 1-2**: Auth flow working, workspace CRUD, basic editor rendering BlockNote blocks, Light/Dark theme toggle, sidebar navigation.

---

### Phase 2: Data Layer & Linking (Tuần 3-4)

> Server Actions CRUD, `[[ ]]` parser, backlink UI, Markdown export/import.
> **Acceptance**: Link hai chiều hoạt động, export/import `.md` chuẩn.

---

#### Component 2.1: Server Actions — CRUD

##### [NEW] src/server/actions/workspaces.ts
- `listWorkspaces()`, `createWorkspace()`, `updateWorkspace()`, `deleteWorkspace()`
- Zod validation on all inputs

##### [NEW] src/server/actions/documents.ts
- `listDocuments()`, `getDocument()`, `createDocument()`, `updateDocument()`, `deleteDocument()`
- `getDocumentTree()` — recursive tree building
- `searchDocumentsForLink()` — full-text search for `[[ ]]` autocomplete

##### [NEW] src/server/actions/blocks.ts
- `getBlocks()` — fetch all blocks for a document
- Integrate with `/api/sync` for batch saves

##### [NEW] src/server/actions/links.ts
- `createLink()`, `deleteLink()`, `getBacklinks()`, `getLinkPreview()`

---

#### Component 2.2: Block Sync API

##### [NEW] src/app/api/sync/route.ts
- `POST /api/sync` — batch block operations (insert, update, delete, move)
- Version-based conflict resolution
- Optimistic lock with version counter
- Zod request validation

---

#### Component 2.3: Bi-directional Linking

##### [NEW] src/lib/editor/link-parser.ts
- Parse `[[ ]]` syntax from BlockNote content
- Extract document references
- Create/update `document_links` records on save

##### [NEW] src/components/editor/LinkAutocomplete.tsx
- Triggered by typing `[[` in editor
- Fuzzy search documents in workspace
- Show document type icon + title
- Insert link node on selection

##### [NEW] src/components/editor/LinkPreview.tsx
- Hover preview popover on `[[Document]]` links
- Show excerpt, type, status, word count
- Click to navigate

##### [NEW] src/components/editor/BacklinksPanel.tsx
- Bottom section of editor or sidebar tab
- List all documents that link TO this document
- Grouped by link type

---

#### Component 2.4: Export & Import

##### [NEW] src/server/actions/export.ts
- `exportDocument()` — convert BlockNote JSON → Markdown with YAML frontmatter
- `exportWorkspace()` — bulk export as .zip
- Resolve `[[doc_id]]` → `[[Doc Title]]` in output

##### [NEW] src/server/actions/import.ts
- `importDocument()` — parse Markdown → BlockNote JSON blocks
- `bulkImport()` — handle multiple files
- Parse `[[...]]` links and create `document_links`

**Deliverables Tuần 3-4**: Full CRUD, `[[]]` linking with autocomplete, backlinks panel, Markdown export/import.

---

### Phase 3: AI Pipeline — RAG (Tuần 5-6)

> Chunking engine, pgvector, LLM integration, Chat UI.
> **Acceptance**: AI trả lời đúng ngữ cảnh, citation link ngược, latency < 3s.

---

#### Component 3.1: Ingestion Pipeline

##### [NEW] src/lib/ai/chunker.ts
- Split document text into chunks (max 600 tokens, overlap 100)
- Metadata per chunk: `doc_id`, `block_id`, `type`, `char_name`, `setting`
- Incremental mode: only re-chunk changed blocks

##### [NEW] src/lib/ai/embedder.ts
- Generate embeddings via `text-embedding-3-small` (1536 dimensions)
- Batch embedding support
- Error handling + retry logic

##### [NEW] src/app/api/ingest/route.ts
- `POST /api/ingest` — trigger chunking + embedding for a document
- Diff against existing chunks (skip unchanged)
- Upsert chunks + embeddings into pgvector
- Delete orphaned chunks

##### [NEW] src/server/actions/ingest.ts
- `getIngestionStatus()` — check indexing status
- `reindexWorkspace()` — batch re-index all docs
- Hook into block save flow: trigger ingestion after sync

---

#### Component 3.2: RAG Retrieval

##### [NEW] src/lib/ai/retriever.ts
- Hybrid search: pgvector cosine similarity + metadata filter
- Top-K = 5, configurable threshold (default 0.7)
- Support context scoping: full-project, folder, document

##### [NEW] src/lib/ai/prompts.ts
- System prompt templates for different modes:
  - `prose` — creative writing assistance
  - `analysis` — plot analysis, conflict detection
  - `roleplay` — character roleplay (Phase 4)
- RAG prompt assembly: system + retrieved chunks + user query
- Citation instruction: `[[citation_id]]` format

##### [NEW] src/lib/ai/cache.ts
- Upstash Redis integration
- Cache similar queries (1h TTL)
- Rate limiting counters

---

#### Component 3.3: AI Chat (Streaming)

##### [NEW] src/app/api/chat/route.ts
- `POST /api/chat` — streaming AI chat via SSE
- AI SDK `streamText()` integration
- SSE events: `metadata`, `delta`, `citation`, `suggestion`, `usage`, `done`
- Rate limiting: 20/min (free), 60/min (pro)
- Fallback: switch to smaller model on timeout

##### [NEW] src/app/(workspace)/[workspaceId]/chat/page.tsx
- Full-page AI chat interface
- Context selector (Full Project / Folder / Document)
- Chat history sidebar
- Message list with streaming support
- Suggestion chips (actionable follow-ups)

##### [NEW] src/components/ai/ChatInterface.tsx
- Chat message list (user + assistant bubbles)
- Streaming text display
- Citation chips (clickable → navigate to source doc)
- Conflict detection cards (structured alerts)

##### [NEW] src/components/ai/ChatInput.tsx
- Input area with Newsreader placeholder
- Submit button (Violet accent)
- Keyboard shortcut: Cmd+Enter
- Mode indicator (Prose/Analysis)

##### [NEW] src/components/ai/ChatHistory.tsx
- Sidebar: conversation list grouped by date
- Active conversation highlight
- Rename/Delete actions

##### [NEW] src/components/ai/CitationChip.tsx
- Pill-shaped chip: `[[Document Title]]`
- Background: `secondary` at 10% opacity
- Click handler: navigate to source document + highlight block

##### [NEW] src/server/actions/conversations.ts
- `listConversations()`, `getConversationMessages()`, `deleteConversation()`, `renameConversation()`

**Deliverables Tuần 5-6**: Documents auto-indexed on save, AI chat with streaming + citations, context-scoped search, conversation history.

---

### Phase 4: AI Agent & Polish (Tuần 7-8)

> Inline AI, Soul Assistant drawer, plot checker, loading states, error handling.
> **Acceptance**: Chat nhân vật ổn định, retention D7 > 25%, bug critical = 0.

---

#### Component 4.1: Inline AI (Editor)

##### [NEW] src/app/api/ai/inline/route.ts
- `POST /api/ai/inline` — streaming inline AI actions
- Actions: continue, rewrite, expand, shorten, change-tone, fix-grammar
- Surrounding context awareness (before/after selection)

##### [NEW] src/components/editor/InlineAIMenu.tsx
- Triggered on text selection (bubble menu extension)
- AI action buttons: Continue, Rewrite, Expand, Shorten
- Streaming result preview
- "Apply to Draft" / "Regenerate" actions

##### [MODIFY] src/components/editor/BlockEditor.tsx
- Integrate Inline AI Menu into BlockNote bubble menu
- Add "Write with AI" items to Slash menu
- AI result insertion (replace, insert-after, insert-before)

---

#### Component 4.2: Soul Assistant Drawer

##### [NEW] src/components/ai/SoulAssistant.tsx
- Right-side drawer (320px), triggered by Cmd+J
- Tabs: Context / Suggestions
- Real-time analysis of current document
- Character motive analysis
- Plot point suggestions
- Visual reference cards

##### [NEW] src/components/ai/AnalysisCard.tsx
- Analysis result card (Character Motive, Plot Point, etc.)
- Citation links within analysis
- "Explore" / "Apply to Draft" actions

##### [MODIFY] src/app/(workspace)/[workspaceId]/documents/[docId]/page.tsx
- Add Soul Assistant Drawer to editor layout (3rd column)
- Toggle with Cmd+J, close with Esc
- Responsive: overlay on tablet/mobile

---

#### Component 4.3: Semantic Search & Knowledge Graph

##### [NEW] src/server/actions/search.ts
- `semanticSearch()` — hybrid vector + metadata search
- `getKnowledgeGraph()` — nodes and edges for visualization
- `extractEntities()` — background entity detection

##### [MODIFY] src/components/dashboard/KnowledgeWeb.tsx
- Replace static placeholder with interactive graph
- Use lightweight graph library (e.g., `@react-force-graph` or custom Canvas)
- Nodes: color-coded by document type
- Edges: link types
- AI analysis indicator

##### [NEW] src/components/search/CommandMenu.tsx
- Cmd+K global command palette
- Semantic search across workspace
- Quick actions: new document, switch workspace, toggle theme
- Recent documents

---

#### Component 4.4: Error Handling & Loading States

##### [NEW] src/components/ui/LoadingStates.tsx
- Skeleton loaders matching ScribeSoul design
- Editor placeholder shimmer
- Chat message typing indicator
- Sidebar skeleton

##### [NEW] src/components/ui/ErrorBoundary.tsx
- Graceful error boundaries
- AI fallback messages
- Retry logic for failed API calls

##### [MODIFY] All streaming components
- Add loading indicators
- Stream progress feedback
- Error state handling with retry

##### [NEW] src/app/error.tsx + src/app/not-found.tsx
- Custom error pages with ScribeSoul branding

**Deliverables Tuần 7-8**: Inline AI in editor, Soul Assistant drawer, Cmd+K command palette, knowledge graph visualization, robust error handling.

---

### Phase 5: Beta & Deploy (Tuần 9-10)

> Production deploy, analytics, onboarding, final polish.
> **Acceptance**: 50 beta testers, AI cost < $0.02/session, NPS > 40.

---

#### Component 5.1: Production Deployment

##### [NEW] vercel.json
- Build configuration
- Environment variables mapping
- Edge function regions

##### [NEW] .github/workflows/deploy.yml
- CI/CD: lint → type-check → build → deploy
- Drizzle migration step
- Preview deployments on PRs

##### [MODIFY] src/middleware.ts
- Add rate limiting middleware via Upstash
- Security headers
- CORS configuration

---

#### Component 5.2: Settings Page

##### [NEW] src/app/(workspace)/[workspaceId]/settings/page.tsx
- Profile settings (name, avatar, bio)
- Preferences (theme, editor font size, line height, autosave)
- AI settings (default model, temperature, enable/disable features)
- Plan & usage display
- Account deletion with confirmation

##### [NEW] src/server/actions/settings.ts
- `getUserSettings()`, `updateUserSettings()`, `updateProfile()`
- `deleteAccount()` with cascade

---

#### Component 5.3: Onboarding Flow

##### [NEW] src/components/onboarding/OnboardingWizard.tsx
- Step 1: Welcome + workspace name
- Step 2: Theme selection (Light/Dark preview)
- Step 3: Create first document (template options)
- Step 4: AI tour (Soul Assistant demo)

---

#### Component 5.4: Analytics & Monitoring

##### [NEW] src/lib/analytics.ts
- Track key metrics: AI session rate, context accuracy, time-to-first-value
- Word count tracking per session

##### [MODIFY] src/app/(workspace)/[workspaceId]/page.tsx
- Add Productivity Pulse widget (words this cycle)
- Writing streak indicator
- AI cost dashboard

##### Setup: Sentry
- Frontend + Backend error tracking
- Performance monitoring

**Deliverables Tuần 9-10**: Production on Vercel + Neon, settings page, onboarding flow, analytics, monitoring.

---

## Open Questions

> [!IMPORTANT]
> **Database hosting**: Bạn đã có tài khoản NeonDB chưa? Nếu chưa, tôi sẽ hướng dẫn setup.

> [!IMPORTANT]
> **AI Model preference**: OpenRouter (multi-model) hay direct OpenAI/Anthropic API? OpenRouter linh hoạt hơn nhưng thêm 1 layer latency.

> [!WARNING]
> **Email provider cho Magic Link**: Plan sử dụng Resend (free tier 100 emails/day). Có alternative nào bạn muốn dùng không?

> [!IMPORTANT]
> **Bắt đầu từ phase nào?** Tôi recommend bắt đầu Phase 0 + Phase 1 ngay. Có muốn thay đổi thứ tự ưu tiên không?

---

## Verification Plan

### Automated Tests
- **Phase 1**: `npm run build` pass, auth flow e2e test (browser tool), editor renders
- **Phase 2**: CRUD Server Actions unit tests, link parser tests, export/import round-trip test
- **Phase 3**: Ingestion pipeline test (chunk + embed), RAG retrieval accuracy test, chat streaming test
- **Phase 4**: Inline AI test, Cmd+K functionality test
- **Phase 5**: Full build + deploy, Lighthouse performance audit

### Manual Verification
- **Mỗi phase**: Browser walkthrough recording để demo UI
- **Design validation**: Screenshot so sánh với mockups trong `.design/`
- **AI accuracy**: Manual testing với sample creative writing content
- **Performance**: AI response latency < 3s, page load < 2s

### KPI Tracking (Post-deploy)
| Metric | Target |
|--------|--------|
| AI Session Rate | > 40% |
| Context Accuracy | > 85% |
| Time-to-First-Value | < 3 min |
| AI Cost/Session | < $0.015 |
| Retention D7 | > 30% |

---

## File Summary

| Phase | New Files | Modified Files | Total |
|-------|-----------|----------------|-------|
| **Phase 0** | ~8 (config) | 2 | 10 |
| **Phase 1** | ~25 | 1 | 26 |
| **Phase 2** | ~10 | 0 | 10 |
| **Phase 3** | ~15 | 1 | 16 |
| **Phase 4** | ~8 | 4 | 12 |
| **Phase 5** | ~8 | 3 | 11 |
| **Total** | **~74** | **11** | **~85** |
