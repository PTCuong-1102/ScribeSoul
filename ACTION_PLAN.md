# 📋 ACTION PLAN - Những việc cần làm ngay

## 🚨 **URGENT (3-5 ngày)**

### 1. **Hoàn thiện Block Editor Sync** 
**File**: `src/components/editor/BlockEditor.tsx` + `src/app/api/sync/route.ts`

**Hiện tại**: Editor render được nhưng không lưu

**Cần làm**:
```typescript
// BlockEditor.tsx - thêm save logic
const handleSave = async (blocks: PartialBlock[]) => {
  setSyncStatus("saving")
  try {
    const res = await fetch(`/api/sync`, {
      method: "POST",
      body: JSON.stringify({
        documentId,
        blocks,
        workspaceId,
      })
    })
    setSyncStatus("saved")
  } catch (e) {
    setSyncStatus("error")
  }
}

// api/sync/route.ts - implement POST handler
export async function POST(req: Request) {
  const { documentId, blocks } = await req.json()
  // Save to database
  // Return conflict if needed
}
```

**Ước tính**: 4-6 giờ

---

### 2. **Setup Vector Embedding Pipeline**
**File**: `src/lib/ai/chunker.ts` + `src/app/api/ingest/route.ts`

**Hiện tại**: Chỉ có skeleton, chưa hoạt động

**Cần làm**:
```bash
# 1. Enable pgvector extension in Neon
# Run in NeonDB console:
# CREATE EXTENSION IF NOT EXISTS vector;

# 2. Create embeddings table
# (Drizzle migration)

# 3. Implement chunker
npm install langchain  # or simple implementation

# 4. Implement ingest API
```

**Ước tính**: 6-8 giờ

---

### 3. **Fix Semantic Search (RAG)**
**File**: `src/lib/ai/retriever.ts`

**Hiện tại**: Function tồn tại nhưng không connect DB

**Cần làm**:
```typescript
export async function retrieveContext(
  workspaceId: string,
  query: string,
  limit: number = 5
) {
  // 1. Generate embedding cho query
  const queryEmbedding = await generateEmbedding(query)
  
  // 2. Similarity search trong pgvector
  const results = await db.query.embeddings.findMany({
    where: (t) => eq(t.workspaceId, workspaceId),
    orderBy: (t) => t.embedding.cosineDistance(queryEmbedding),
    limit,
  })
  
  // 3. Return formatted results
}
```

**Ước tính**: 3-4 giờ

---

## ⚠️ **HIGH PRIORITY (1 tuần)**

### 4. **Document Management Server Actions**
- [ ] `createDocument()` - tạo document mới
- [ ] `deleteDocument()` - xóa document
- [ ] `updateDocumentTitle()` - rename
- [ ] `moveDocument()` - drag-drop tree
- [ ] `listDocuments()` - get all with pagination

**Ước tính**: 8-10 giờ

### 5. **Error Handling & Validation**
- [ ] Setup `lib/env.ts` - validate environment variables on startup
- [ ] Setup `lib/errors.ts` - custom error classes
- [ ] Setup `src/app/error.tsx` - global error boundary
- [ ] Add error responses middleware

**Ước tính**: 4-6 giờ

### 6. **UI/UX Quick Wins**
- [ ] Add toast notifications (`npm install sonner`)
- [ ] Dark mode toggle button (TopBar)
- [ ] Loading states (skeletons)
- [ ] Empty states (Cmd + K guide, no docs message)

**Ước tính**: 6-8 giờ

### 7. **Rate Limiting**
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests/hour
})

export async function middleware(request: NextRequest) {
  const ip = request.ip || "127.0.0.1"
  const { success } = await ratelimit.limit(ip)
  if (!success) return new Response("Rate limit exceeded", { status: 429 })
}
```

**Ước tính**: 2-3 giờ

---

## 📋 **MEDIUM PRIORITY (2 tuần)**

### 8. **Command Palette (Cmd+K)**
- [ ] Setup `cmdk` library
- [ ] Implement command routing
- [ ] Add search commands
- [ ] Add creation commands

**Ước tính**: 8-10 giờ

### 9. **Backlinks & Knowledge Graph**
- [ ] Link parser implementation
- [ ] Auto-linking logic
- [ ] KnowledgeWeb visualization

**Ước tính**: 12-16 giờ

### 10. **Export/Import**
- [ ] Markdown export
- [ ] File import handler
- [ ] Batch operations

**Ước tính**: 6-8 giờ

### 11. **CI/CD & Testing**
- [ ] Setup GitHub Actions workflow
- [ ] Add unit tests for key functions
- [ ] Add integration tests for APIs

**Ước tính**: 8-10 giờ

---

## 📊 **Development Checklist Template**

Sao chép vào `.github/DEVELOPMENT.md`:

```markdown
# Development Checklist

## Before Deployment

### Database
- [ ] Verify Neon connection string
- [ ] Check pgvector extension enabled
- [ ] Run migrations: `npm run db:push`
- [ ] Verify RLS policies

### Environment
- [ ] All .env variables set
- [ ] SECRET tokens generated
- [ ] API keys rotated
- [ ] No dev credentials in production

### Features
- [ ] Block editor saves correctly
- [ ] RAG retrieval returns results
- [ ] Search works (both full-text + semantic)
- [ ] Auth flow complete (signup, login, logout)
- [ ] Error handling catches failures

### Performance
- [ ] No N+1 queries in logs
- [ ] API response time < 2s (chat should stream)
- [ ] Database connection pooling working
- [ ] Images lazy-loaded

### Security
- [ ] No console.logs exposing secrets
- [ ] XSS protection on editor content
- [ ] CSRF tokens in forms
- [ ] Rate limiting active

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Logging structured
- [ ] Metrics collected
- [ ] Alerts set up

## Post-Launch
- [ ] Monitor error rates
- [ ] Check RAG quality
- [ ] User feedback collection
- [ ] Performance profiling
```

---

## 🎯 **Priority Matrix**

```
HIGH IMPACT + HIGH EFFORT:
  → Vector Embedding Pipeline (blocks RAG)
  → Block Editor Sync (blocks usage)
  → Document Management (blocks workflow)

HIGH IMPACT + LOW EFFORT:
  → Error handling setup
  → Toast notifications
  → Rate limiting
  → Dark mode toggle

LOW IMPACT + HIGH EFFORT:
  → Knowledge Graph visualization
  → Export/Import features
  → Advanced analytics

LOW IMPACT + LOW EFFORT:
  → Add loading skeletons
  → Improve empty states
  → Better error messages
```

---

## 📞 **Recommended Next Steps**

1. **Today/Tomorrow**: 
   - Start with Block Editor sync (most blocking)
   - Setup basic error handling

2. **This Week**:
   - Complete Vector embedding pipeline
   - Fix RAG retrieval
   - Document management functions

3. **Next Week**:
   - UI/UX polish
   - Rate limiting + security
   - Testing setup

4. **Before Launch**:
   - Full security audit
   - Performance testing
   - User acceptance testing

---

**Estimated time to MVP ready: 2-3 weeks** (if prioritized correctly)
