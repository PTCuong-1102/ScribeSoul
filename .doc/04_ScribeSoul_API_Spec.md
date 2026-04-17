# 📡 ScribeSoul — API Specification

> **Version**: 1.0.0-draft  
> **Last Updated**: 2026-04-17  
> **Base URL**: `https://app.scribesoul.io` (Production) | `http://localhost:3000` (Dev)  
> **Architecture**: Next.js App Router — Server Actions + Route Handlers  
> **Auth**: Auth.js v5 (JWT session) — Bearer token or HttpOnly cookie

---

## 📐 Conventions

### General Rules
- All IDs use **UUID v7**
- Timestamps follow **ISO 8601** (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- Request/Response bodies use **JSON** (`Content-Type: application/json`)
- Streaming endpoints use **`text/event-stream`** (SSE)
- Pagination uses **cursor-based** (`cursor` + `limit`) unless noted
- All user-specific endpoints require authentication
- Rate limiting headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request — validation error |
| `401` | Unauthorized — missing/invalid session |
| `403` | Forbidden — RLS policy violation |
| `404` | Not Found |
| `409` | Conflict — version mismatch (sync) |
| `429` | Too Many Requests — rate limited |
| `500` | Internal Server Error |
| `503` | Service Unavailable — AI provider down |

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### Standard Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "uuid-v7-value | null",
    "hasMore": true,
    "total": 42
  }
}
```

---

## 1. 🔐 Authentication

> **Implementation**: Auth.js v5 with `DrizzleAdapter` + NeonDB  
> **Providers**: Google, GitHub, Magic Link (Email)  
> **Session**: JWT (HttpOnly cookie `authjs.session-token`)

Auth is managed entirely by Auth.js built-in route handlers.  
These are **NOT** custom API routes — they are auto-configured by Auth.js under `/api/auth/*`.

### 1.1. Auth.js Built-in Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/signin` | Render sign-in page (redirects) |
| `POST` | `/api/auth/signin/:provider` | Initiate OAuth or email sign-in |
| `GET` | `/api/auth/callback/:provider` | OAuth callback handler |
| `POST` | `/api/auth/signout` | Sign out, clear session |
| `GET` | `/api/auth/session` | Get current session |
| `GET` | `/api/auth/csrf` | Get CSRF token |
| `GET` | `/api/auth/providers` | List configured providers |

### 1.2. Session Object

```json
// GET /api/auth/session
{
  "user": {
    "id": "01913a3b-7c8d-7000-8000-000000000001",
    "name": "Elias Vance",
    "email": "elias@scribesoul.io",
    "image": "https://avatars.example.com/elias.jpg"
  },
  "expires": "2026-05-17T04:00:00.000Z"
}
```

### 1.3. Server Action: Get Current User Profile

```typescript
// Server Action: src/server/actions/auth.ts
"use server"

async function getCurrentUser(): Promise<User>
```

**Response:**
```json
{
  "id": "01913a3b-...",
  "email": "elias@scribesoul.io",
  "name": "Elias Vance",
  "avatarUrl": "https://...",
  "plan": "free",
  "createdAt": "2026-04-01T00:00:00.000Z",
  "updatedAt": "2026-04-17T04:00:00.000Z"
}
```

---

## 2. 📂 Workspaces

> **Implementation**: Server Actions  
> **Authorization**: Owner only (RLS: `owner_id = current_user_id()`)

### 2.1. List Workspaces

```typescript
// Server Action
async function listWorkspaces(): Promise<Workspace[]>
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913a3b-...",
      "name": "The Silent Manuscript",
      "settings": {
        "theme": "dark",
        "defaultDocType": "doc",
        "aiModel": "gpt-4o"
      },
      "documentCount": 24,
      "createdAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

### 2.2. Create Workspace

```typescript
// Server Action
async function createWorkspace(data: CreateWorkspaceInput): Promise<Workspace>
```

**Input:**
```json
{
  "name": "The Silent Manuscript",
  "settings": {
    "theme": "light",
    "defaultDocType": "doc"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | ✅ | 1-100 chars |
| `settings` | `object` | ❌ | Defaults to `{}` |

**Response:** `201` — Created workspace object

### 2.3. Update Workspace

```typescript
// Server Action  
async function updateWorkspace(
  workspaceId: string, 
  data: UpdateWorkspaceInput
): Promise<Workspace>
```

**Input:**
```json
{
  "name": "The Midnight Archive",
  "settings": {
    "theme": "dark",
    "aiModel": "claude-sonnet-4-20250514"
  }
}
```

### 2.4. Delete Workspace

```typescript
// Server Action
async function deleteWorkspace(workspaceId: string): Promise<void>
```

**Response:** `204` No Content  
**Side Effects:** Cascading delete of all documents, blocks, chunks, embeddings

---

## 3. 📄 Documents

> **Implementation**: Server Actions  
> **Authorization**: Must belong to user's workspace (RLS)  
> **Types**: `doc` | `character` | `setting` | `plot`

### 3.1. List Documents

```typescript
// Server Action
async function listDocuments(params: ListDocumentsInput): Promise<PaginatedResponse<Document>>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "parentId": null,
  "type": "doc",
  "status": "draft",
  "search": "chapter 3",
  "sortBy": "updatedAt",
  "sortOrder": "desc",
  "cursor": null,
  "limit": 20
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `workspaceId` | `uuid` | ✅ | — | Workspace filter |
| `parentId` | `uuid \| null` | ❌ | `null` | Parent document (for tree) |
| `type` | `enum` | ❌ | all | `doc`, `character`, `setting`, `plot` |
| `status` | `string` | ❌ | all | `draft`, `revision`, `finished`, `idea` |
| `search` | `string` | ❌ | — | Full-text search on title |
| `sortBy` | `string` | ❌ | `updatedAt` | `updatedAt`, `createdAt`, `title` |
| `sortOrder` | `string` | ❌ | `desc` | `asc`, `desc` |
| `cursor` | `uuid` | ❌ | `null` | Pagination cursor |
| `limit` | `int` | ❌ | `20` | 1-100 |

**Response:**
```json
{
  "data": [
    {
      "id": "01913a3b-...",
      "workspaceId": "01913a3b-...",
      "parentId": null,
      "title": "Chapter 3: The Iron Spire",
      "type": "doc",
      "status": "draft",
      "metadata": {
        "wordCount": 4502,
        "tags": ["act-1", "mystery"],
        "coverImage": "https://..."
      },
      "createdAt": "2026-04-10T00:00:00.000Z",
      "updatedAt": "2026-04-17T02:30:00.000Z"
    }
  ],
  "pagination": {
    "nextCursor": "01913a3c-...",
    "hasMore": true,
    "total": 24
  }
}
```

### 3.2. Get Document (with Blocks)

```typescript
// Server Action
async function getDocument(documentId: string): Promise<DocumentWithBlocks>
```

**Response:**
```json
{
  "id": "01913a3b-...",
  "workspaceId": "01913a3b-...",
  "parentId": null,
  "title": "Chapter 3: The Iron Spire",
  "type": "doc",
  "status": "draft",
  "metadata": {
    "wordCount": 4502,
    "tags": ["act-1"],
    "coverImage": null
  },
  "blocks": [
    {
      "id": "01913b00-...",
      "type": "heading",
      "content": {
        "type": "heading",
        "props": { "level": 1 },
        "content": [{ "type": "text", "text": "The Iron Spire" }]
      },
      "sortOrder": 0,
      "parentBlockId": null
    },
    {
      "id": "01913b01-...",
      "type": "paragraph",
      "content": {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "The clock in the library didn't tick; it breathed..." }
        ]
      },
      "sortOrder": 1,
      "parentBlockId": null
    }
  ],
  "backlinks": [
    {
      "sourceId": "01913c00-...",
      "sourceTitle": "Character: Elias Thorne",
      "linkType": "character-link"
    }
  ],
  "createdAt": "2026-04-10T00:00:00.000Z",
  "updatedAt": "2026-04-17T02:30:00.000Z"
}
```

### 3.3. Create Document

```typescript
// Server Action
async function createDocument(data: CreateDocumentInput): Promise<Document>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "parentId": null,
  "title": "Chapter 4: Echoes of the Spire",
  "type": "doc",
  "metadata": {
    "tags": ["act-1", "chapter"]
  }
}
```

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `workspaceId` | `uuid` | ✅ | — | Must exist, owned by user |
| `parentId` | `uuid \| null` | ❌ | `null` | Must exist in same workspace |
| `title` | `string` | ❌ | `"Untitled"` | Max 255 chars |
| `type` | `enum` | ❌ | `"doc"` | `doc`, `character`, `setting`, `plot` |
| `metadata` | `object` | ❌ | `{}` | Free-form JSONB |

**Response:** `201` — Created document object

### 3.4. Update Document

```typescript
// Server Action
async function updateDocument(
  documentId: string, 
  data: UpdateDocumentInput
): Promise<Document>
```

**Input:**
```json
{
  "title": "Chapter 4: Echoes of the Spire (Revised)",
  "status": "revision",
  "parentId": "01913a3b-...",
  "metadata": {
    "tags": ["act-1", "chapter", "revised"],
    "wordCount": 5100
  }
}
```

### 3.5. Delete Document

```typescript
// Server Action
async function deleteDocument(documentId: string): Promise<void>
```

**Response:** `204` No Content  
**Side Effects:** CASCADE → blocks, chunks, embeddings, links (source) deleted. Target links set to NULL.

### 3.6. Get Document Tree

```typescript
// Server Action
async function getDocumentTree(workspaceId: string): Promise<DocumentTreeNode[]>
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913a3b-...",
      "title": "Act I",
      "type": "doc",
      "status": "draft",
      "children": [
        {
          "id": "01913a3c-...",
          "title": "Chapter 1: The Weaver's Paradox",
          "type": "doc",
          "status": "drafting",
          "children": []
        },
        {
          "id": "01913a3d-...",
          "title": "Chapter 2: Salt & Stardust",
          "type": "doc",
          "status": "finished",
          "children": []
        }
      ]
    },
    {
      "id": "01913b00-...",
      "title": "Characters",
      "type": "character",
      "status": "draft",
      "children": [
        {
          "id": "01913b01-...",
          "title": "Elias Thorne",
          "type": "character",
          "status": "draft",
          "children": []
        }
      ]
    }
  ]
}
```

---

## 4. 🧱 Blocks (Content Sync)

> **Implementation**: Route Handler (`/api/sync`) + Server Actions  
> **Sync Strategy**: Debounce 1s client-side → batch POST → Optimistic UI  
> **Conflict Resolution**: Version-based (optimistic lock)

### 4.1. Sync Blocks (Batch Save)

```
POST /api/sync
```

> This is the primary content persistence endpoint. Called by the BlockNote editor on save (debounced 1s).

**Request:**
```json
{
  "documentId": "01913a3b-...",
  "version": 42,
  "operations": [
    {
      "op": "insert",
      "block": {
        "id": "01913c00-...",
        "type": "paragraph",
        "content": {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "New paragraph content..." }]
        },
        "sortOrder": 3,
        "parentBlockId": null
      }
    },
    {
      "op": "update",
      "blockId": "01913b01-...",
      "changes": {
        "content": {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Updated content..." }]
        },
        "sortOrder": 1
      }
    },
    {
      "op": "delete",
      "blockId": "01913b02-..."
    },
    {
      "op": "move",
      "blockId": "01913b03-...",
      "newSortOrder": 5,
      "newParentBlockId": null
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentId` | `uuid` | ✅ | Target document |
| `version` | `int` | ✅ | Client's current version (optimistic lock) |
| `operations` | `array` | ✅ | Batch of block operations |
| `operations[].op` | `enum` | ✅ | `insert`, `update`, `delete`, `move` |

**Success Response:** `200`
```json
{
  "version": 43,
  "appliedOps": 4,
  "timestamp": "2026-04-17T04:30:00.000Z"
}
```

**Conflict Response:** `409`
```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Document has been modified. Current version: 44, your version: 42",
    "serverVersion": 44,
    "serverBlocks": [...]
  }
}
```

### 4.2. Get Blocks for Document

```typescript
// Server Action
async function getBlocks(documentId: string): Promise<Block[]>
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913b00-...",
      "documentId": "01913a3b-...",
      "type": "heading",
      "content": { "type": "heading", "props": { "level": 1 }, "content": [...] },
      "sortOrder": 0,
      "parentBlockId": null,
      "createdAt": "2026-04-10T00:00:00.000Z"
    }
  ]
}
```

---

## 5. 🔗 Document Links (Bi-directional)

> **Implementation**: Server Actions  
> **Trigger**: Parsing `[[ ]]` syntax in editor content  
> **Link Types**: `mention` | `reference` | `plot-link` | `character-link`

### 5.1. Create Link

```typescript
// Server Action
async function createLink(data: CreateLinkInput): Promise<DocumentLink>
```

**Input:**
```json
{
  "sourceId": "01913a3b-...",
  "targetId": "01913c00-...",
  "type": "character-link"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `sourceId` | `uuid` | ✅ | Must exist in user's workspace |
| `targetId` | `uuid` | ✅ | Must exist in same workspace |
| `type` | `enum` | ❌ | Default: `mention`. Options: `mention`, `reference`, `plot-link`, `character-link` |

**Response:** `201`
```json
{
  "id": "01913d00-...",
  "sourceId": "01913a3b-...",
  "targetId": "01913c00-...",
  "type": "character-link",
  "createdAt": "2026-04-17T04:00:00.000Z"
}
```

**Duplicate:** `409` — Link already exists (UNIQUE constraint on `source_id, target_id`)

### 5.2. Delete Link

```typescript
// Server Action
async function deleteLink(linkId: string): Promise<void>
```

**Response:** `204` No Content

### 5.3. Get Backlinks for Document

```typescript
// Server Action
async function getBacklinks(documentId: string): Promise<Backlink[]>
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913d00-...",
      "sourceId": "01913a3b-...",
      "sourceTitle": "Chapter 3: The Iron Spire",
      "sourceType": "doc",
      "linkType": "mention",
      "createdAt": "2026-04-17T04:00:00.000Z"
    }
  ]
}
```

### 5.4. Search Documents for Linking (`[[ ]]` autocomplete)

```typescript
// Server Action
async function searchDocumentsForLink(params: LinkSearchInput): Promise<LinkSearchResult[]>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "query": "Elias",
  "limit": 10
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913b01-...",
      "title": "Elias Thorne",
      "type": "character",
      "snippet": "A former archivist haunted by the silence..."
    },
    {
      "id": "01913c01-...",
      "title": "Chapter 5: Elias's Descent",
      "type": "doc",
      "snippet": null
    }
  ]
}
```

### 5.5. Get Link Preview (Hover)

```typescript
// Server Action
async function getLinkPreview(documentId: string): Promise<LinkPreview>
```

**Response:**
```json
{
  "id": "01913b01-...",
  "title": "Elias Thorne",
  "type": "character",
  "status": "draft",
  "excerpt": "A former archivist haunted by the silence of the Great Library. His obsession with the Obsidian Lectern...",
  "metadata": {
    "tags": ["protagonist", "act-1"],
    "wordCount": 3200
  },
  "updatedAt": "2026-04-16T10:00:00.000Z"
}
```

---

## 6. 🤖 AI Chat (Streaming RAG)

> **Implementation**: Route Handler (`/api/chat`) — SSE streaming  
> **Rate Limit**: 20 requests/minute (free), 60/min (pro)  
> **Models**: OpenAI/Anthropic via OpenRouter  
> **Cache**: Upstash Redis — similar queries cached 1h

### 6.1. Send Chat Message (Streaming)

```
POST /api/chat
```

**Request:**
```json
{
  "conversationId": "01913e00-...",
  "message": "Check for plot holes in Nam's journey on April 13th.",
  "context": {
    "type": "full-project",
    "workspaceId": "01913a3b-..."
  },
  "options": {
    "model": "gpt-4o",
    "mode": "prose",
    "characterId": null,
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversationId` | `uuid \| null` | ❌ | `null` → creates new conversation |
| `message` | `string` | ✅ | User message (max 4000 chars) |
| `context.type` | `enum` | ✅ | `full-project`, `folder`, `document` |
| `context.workspaceId` | `uuid` | ✅ | Workspace scope |
| `context.documentIds` | `uuid[]` | ❌ | Specific documents for context |
| `context.folderId` | `uuid` | ❌ | Folder scope |
| `options.model` | `string` | ❌ | Default: workspace setting |
| `options.mode` | `enum` | ❌ | `prose`, `analysis`, `roleplay` |
| `options.characterId` | `uuid \| null` | ❌ | Character doc ID for roleplay mode |
| `options.temperature` | `float` | ❌ | `0.0` - `1.0`, default `0.7` |
| `options.maxTokens` | `int` | ❌ | Default `2048`, max `4096` |

**Response:** `200` — `text/event-stream` (SSE)

```
event: metadata
data: {"conversationId":"01913e00-...","messageId":"01913e01-..."}

event: delta
data: {"content":"I've identified a temporal paradox in Nam's timeline. "}

event: delta
data: {"content":"On April 13th, you have him reaching the "}

event: delta
data: {"content":"**Opal Spires** by midday, but this contradicts..."}

event: citation
data: {"id":"cite-1","documentId":"01913a3c-...","title":"Chapter 2","excerpt":"The mountain pass is a three-day march from the border.","blockId":"01913b05-..."}

event: citation
data: {"id":"cite-2","documentId":"01913a3e-...","title":"Chapter 5","excerpt":"Nam crossed the border at 05:00 on the 13th.","blockId":"01913b09-..."}

event: suggestion
data: {"type":"action","label":"Rewrite Timeline","prompt":"Rewrite the timeline for Nam's journey to resolve the paradox between Chapter 2 and Chapter 5."}

event: suggestion
data: {"type":"action","label":"Explain Logistics","prompt":"Explain how Nam could realistically travel from the border to Opal Spires within the timeframe."}

event: usage
data: {"promptTokens":1842,"completionTokens":523,"totalTokens":2365,"model":"gpt-4o","cached":false}

event: done
data: {}
```

**SSE Event Types:**

| Event | Description |
|-------|-------------|
| `metadata` | Conversation & message IDs (sent first) |
| `delta` | Streamed text content chunks |
| `citation` | Referenced source documents with excerpts |
| `suggestion` | Actionable follow-up chips |
| `conflict` | Detected plot/timeline conflict (structured) |
| `usage` | Token usage & cost info (sent last) |
| `error` | Stream error |
| `done` | Stream complete |

### 6.2. List Conversations

```typescript
// Server Action
async function listConversations(params: ListConversationsInput): Promise<PaginatedResponse<Conversation>>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "cursor": null,
  "limit": 20
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913e00-...",
      "title": "Nam's Journey Holes",
      "contextType": "full-project",
      "messageCount": 8,
      "createdAt": "2026-04-17T03:00:00.000Z",
      "updatedAt": "2026-04-17T04:30:00.000Z"
    }
  ],
  "pagination": {
    "nextCursor": "01913e01-...",
    "hasMore": false,
    "total": 5
  }
}
```

### 6.3. Get Conversation Messages

```typescript
// Server Action
async function getConversationMessages(
  conversationId: string,
  params?: PaginationInput
): Promise<PaginatedResponse<AIMessage>>
```

**Response:**
```json
{
  "data": [
    {
      "id": "01913e01-...",
      "conversationId": "01913e00-...",
      "role": "user",
      "content": "Check for plot holes in Nam's journey on April 13th.",
      "citations": [],
      "tokenUsage": null,
      "createdAt": "2026-04-17T04:00:00.000Z"
    },
    {
      "id": "01913e02-...",
      "conversationId": "01913e00-...",
      "role": "assistant",
      "content": "I've identified a temporal paradox in Nam's timeline...",
      "citations": [
        {
          "id": "cite-1",
          "documentId": "01913a3c-...",
          "title": "Chapter 2",
          "excerpt": "The mountain pass is a three-day march from the border.",
          "blockId": "01913b05-..."
        }
      ],
      "tokenUsage": {
        "promptTokens": 1842,
        "completionTokens": 523,
        "totalTokens": 2365,
        "model": "gpt-4o"
      },
      "createdAt": "2026-04-17T04:00:05.000Z"
    }
  ],
  "pagination": {
    "nextCursor": null,
    "hasMore": false,
    "total": 2
  }
}
```

### 6.4. Delete Conversation

```typescript
// Server Action
async function deleteConversation(conversationId: string): Promise<void>
```

**Response:** `204` No Content

### 6.5. Rename Conversation

```typescript
// Server Action
async function renameConversation(
  conversationId: string,
  title: string
): Promise<Conversation>
```

---

## 7. ✨ Inline AI (Editor Context)

> **Implementation**: Route Handler (`/api/ai/inline`) — SSE streaming  
> **Trigger**: User selects text in editor → AI menu → action  
> **Rate Limit**: 30 requests/minute (free), 100/min (pro)

### 7.1. Inline AI Generate

```
POST /api/ai/inline
```

**Request:**
```json
{
  "documentId": "01913a3b-...",
  "selectedText": "He looked toward the window where the winter moon was hanging low over the manor's sprawling gardens.",
  "action": "continue",
  "surroundingContext": {
    "before": "...afraid that the mere act of writing would shatter the fragile peace of the room.\n\n",
    "after": "\n\nEverything was precisely where it should be..."
  },
  "customPrompt": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentId` | `uuid` | ✅ | Current document |
| `selectedText` | `string` | ✅ | Highlighted text (max 2000 chars) |
| `action` | `enum` | ✅ | See action table below |
| `surroundingContext` | `object` | ❌ | ~500 chars before/after selection |
| `customPrompt` | `string \| null` | ❌ | Free-form instruction |

**Inline AI Actions:**

| Action | Description |
|--------|-------------|
| `continue` | Continue writing from selection |
| `rewrite` | Rewrite selected text |
| `expand` | Expand/elaborate on selection |
| `shorten` | Condense selection |
| `change-tone` | Adjust tone (requires `toneTarget` param) |
| `fix-grammar` | Fix grammar and spelling |
| `translate` | Translate (requires `targetLang` param) |
| `custom` | Use `customPrompt` field |

**Response:** `200` — `text/event-stream` (SSE)

```
event: delta
data: {"content":"The silence seemed to press against the glass, "}

event: delta
data: {"content":"as if the night itself were listening..."}

event: done
data: {"tokenUsage":{"promptTokens":820,"completionTokens":145,"totalTokens":965}}
```

### 7.2. Apply AI Result to Editor

```typescript
// Server Action
async function applyAIResult(data: ApplyAIResultInput): Promise<void>
```

**Input:**
```json
{
  "documentId": "01913a3b-...",
  "blockId": "01913b01-...",
  "action": "replace",
  "content": "The silence seemed to press against the glass...",
  "originalText": "He looked toward the window..."
}
```

| `action` | Description |
|----------|-------------|
| `replace` | Replace selected text with AI result |
| `insert-after` | Insert AI result after selected block |
| `insert-before` | Insert before selected block |

---

## 8. 🔬 Ingestion Pipeline (Chunking & Embedding)

> **Implementation**: Route Handler (`/api/ingest`) — triggered internally  
> **Trigger**: On document save (via Server Action) or manual re-index  
> **Rate Limit**: 10 requests/minute (background)

### 8.1. Ingest Document

```
POST /api/ingest
```

> **Internal endpoint** — called by `saveBlocks` Server Action after sync. Can also be called manually for re-indexing.

**Request:**
```json
{
  "documentId": "01913a3b-...",
  "mode": "incremental",
  "force": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentId` | `uuid` | ✅ | Document to ingest |
| `mode` | `enum` | ❌ | `incremental` (changed blocks only) or `full` (re-chunk entire doc). Default: `incremental` |
| `force` | `boolean` | ❌ | Force re-embed even if content unchanged. Default: `false` |

**Response:** `202` Accepted (async processing)
```json
{
  "jobId": "01913f00-...",
  "documentId": "01913a3b-...",
  "status": "processing",
  "estimatedChunks": 12
}
```

### 8.2. Ingestion Pipeline Steps (Internal)

```
1. Fetch blocks for document
2. Flatten block content to plain text
3. Chunk: max 600 tokens, overlap 100 tokens
   - Metadata per chunk: { doc_id, block_id, type, char_name, setting }
4. Diff against existing chunks (skip unchanged)
5. Embed via `text-embedding-3-small` → 1536 dimensions
6. Upsert into `document_chunks` + `chunk_embeddings`
7. Delete orphaned chunks (blocks removed)
```

### 8.3. Get Ingestion Status

```typescript
// Server Action
async function getIngestionStatus(documentId: string): Promise<IngestionStatus>
```

**Response:**
```json
{
  "documentId": "01913a3b-...",
  "status": "indexed",
  "totalChunks": 12,
  "totalTokens": 5840,
  "lastIndexedAt": "2026-04-17T04:30:00.000Z",
  "errors": []
}
```

### 8.4. Re-index Workspace

```typescript
// Server Action
async function reindexWorkspace(workspaceId: string): Promise<{ jobId: string }>
```

**Response:** `202` Accepted — Batch ingestion of all documents in workspace

---

## 9. 🔍 Search & Knowledge Graph

> **Implementation**: Server Actions  
> **Search**: Hybrid (pgvector cosine similarity + metadata filter)

### 9.1. Semantic Search

```typescript
// Server Action
async function semanticSearch(params: SemanticSearchInput): Promise<SearchResult[]>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "query": "obsidian dagger hidden location",
  "filters": {
    "documentTypes": ["doc", "setting"],
    "documentIds": null,
    "dateRange": null
  },
  "topK": 5,
  "threshold": 0.72
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workspaceId` | `uuid` | ✅ | Scope |
| `query` | `string` | ✅ | Natural language query |
| `filters.documentTypes` | `enum[]` | ❌ | Filter by doc type |
| `filters.documentIds` | `uuid[]` | ❌ | Specific docs only |
| `topK` | `int` | ❌ | Default: `5`, max `20` |
| `threshold` | `float` | ❌ | Min similarity score `0.0-1.0`, default `0.7` |

**Response:**
```json
{
  "data": [
    {
      "chunkId": "01913f01-...",
      "documentId": "01913a3c-...",
      "documentTitle": "Chapter 3: The Iron Spire",
      "blockId": "01913b07-...",
      "content": "The antagonist had moved with a surgeon's precision. There were no broken locks, no ruffled papers. Only the void where the obsidian dagger had once rested.",
      "score": 0.92,
      "metadata": {
        "type": "doc",
        "charName": null,
        "setting": "The Manor"
      }
    }
  ],
  "query": "obsidian dagger hidden location",
  "totalResults": 3,
  "searchTimeMs": 87
}
```

### 9.2. Knowledge Graph Data

```typescript
// Server Action
async function getKnowledgeGraph(workspaceId: string): Promise<KnowledgeGraph>
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "01913b01-...",
      "label": "Elias Thorne",
      "type": "character",
      "metadata": { "status": "draft", "wordCount": 3200 }
    },
    {
      "id": "01913a3c-...",
      "label": "Chapter 3: The Iron Spire",
      "type": "doc",
      "metadata": { "status": "draft", "wordCount": 4502 }
    },
    {
      "id": "01913c01-...",
      "label": "The Manor",
      "type": "setting",
      "metadata": { "status": "draft", "wordCount": 1800 }
    }
  ],
  "edges": [
    {
      "source": "01913a3c-...",
      "target": "01913b01-...",
      "type": "character-link",
      "label": "appears in"
    },
    {
      "source": "01913a3c-...",
      "target": "01913c01-...",
      "type": "plot-link",
      "label": "set in"
    }
  ]
}
```

### 9.3. Entity Extraction (Background)

```typescript
// Server Action (runs async after document save)
async function extractEntities(documentId: string): Promise<ExtractedEntity[]>
```

**Response:**
```json
{
  "data": [
    {
      "name": "Elias Thorne",
      "type": "character",
      "confidence": 0.95,
      "mentions": 7,
      "matchedDocumentId": "01913b01-...",
      "isNew": false
    },
    {
      "name": "The Obsidian Lectern",
      "type": "setting",
      "confidence": 0.82,
      "mentions": 3,
      "matchedDocumentId": null,
      "isNew": true,
      "suggestedAction": "create_document"
    }
  ]
}
```

---

## 10. 📥 Export & Import

> **Implementation**: Server Actions  
> **Formats**: Markdown (`.md`), JSON (BlockNote native)

### 10.1. Export Document

```typescript
// Server Action
async function exportDocument(params: ExportInput): Promise<ExportResult>
```

**Input:**
```json
{
  "documentId": "01913a3b-...",
  "format": "markdown",
  "options": {
    "includeMetadata": true,
    "includeBacklinks": true,
    "resolveLinks": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentId` | `uuid` | ✅ | Document to export |
| `format` | `enum` | ✅ | `markdown`, `json` |
| `options.includeMetadata` | `boolean` | ❌ | Add YAML frontmatter. Default: `true` |
| `options.includeBacklinks` | `boolean` | ❌ | Append backlinks section. Default: `false` |
| `options.resolveLinks` | `boolean` | ❌ | Convert `[[doc_id]]` → `[[Doc Title]]`. Default: `true` |

**Response (Markdown):**
```json
{
  "content": "---\ntitle: \"Chapter 3: The Iron Spire\"\ntype: doc\nstatus: draft\ntags: [act-1, mystery]\ncreated: 2026-04-10\n---\n\n# The Iron Spire\n\nThe clock in the library didn't tick; it breathed...\n\nHe looked toward the window where the [[winter moon]] was hanging low...\n\n## Backlinks\n- [[Character: Elias Thorne]]\n",
  "filename": "chapter-3-the-iron-spire.md",
  "format": "markdown",
  "sizeBytes": 2845
}
```

**Response (JSON):**
```json
{
  "content": {
    "document": { "id": "...", "title": "...", "type": "doc" },
    "blocks": [...]
  },
  "filename": "chapter-3-the-iron-spire.json",
  "format": "json",
  "sizeBytes": 8920
}
```

### 10.2. Export Workspace (Bulk)

```typescript
// Server Action
async function exportWorkspace(params: ExportWorkspaceInput): Promise<{ downloadUrl: string }>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "format": "markdown",
  "structure": "flat"
}
```

| `structure` | Description |
|-------------|-------------|
| `flat` | All `.md` files in single directory |
| `tree` | Preserve parent/child folder hierarchy |

**Response:**
```json
{
  "downloadUrl": "/api/export/download/01913f02-...",
  "format": "zip",
  "fileCount": 24,
  "totalSizeBytes": 89420,
  "expiresAt": "2026-04-17T05:00:00.000Z"
}
```

### 10.3. Import Document

```typescript
// Server Action
async function importDocument(params: ImportInput): Promise<Document>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "parentId": null,
  "file": "<File object>",
  "format": "markdown",
  "options": {
    "parseLinks": true,
    "autoIngest": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workspaceId` | `uuid` | ✅ | Target workspace |
| `parentId` | `uuid \| null` | ❌ | Parent document |
| `file` | `File` | ✅ | `.md` or `.json` file (max 5MB) |
| `format` | `enum` | ✅ | `markdown`, `json` |
| `options.parseLinks` | `boolean` | ❌ | Parse `[[...]]` and create links. Default: `true` |
| `options.autoIngest` | `boolean` | ❌ | Trigger ingestion after import. Default: `true` |

**Response:** `201` — Created document object

### 10.4. Bulk Import

```typescript
// Server Action
async function bulkImport(params: BulkImportInput): Promise<BulkImportResult>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "files": ["<File[]>"],
  "format": "markdown",
  "preserveStructure": true
}
```

**Response:**
```json
{
  "imported": 15,
  "skipped": 2,
  "errors": [
    { "filename": "broken-file.md", "error": "Invalid markdown structure" }
  ],
  "documents": [...]
}
```

---

## 11. ⚙️ User Settings

> **Implementation**: Server Actions  
> **Scope**: User-level settings (not workspace-specific)

### 11.1. Get User Settings

```typescript
// Server Action
async function getUserSettings(): Promise<UserSettings>
```

**Response:**
```json
{
  "profile": {
    "name": "Elias Vance",
    "email": "elias@scribesoul.io",
    "avatarUrl": "https://...",
    "bio": "Fiction writer and world-builder"
  },
  "preferences": {
    "theme": "system",
    "editorFont": "newsreader",
    "editorFontSize": 18,
    "editorLineHeight": 1.7,
    "editorMaxWidth": 800,
    "showWordCount": true,
    "autosaveInterval": 1000,
    "spellCheck": true,
    "language": "en"
  },
  "ai": {
    "defaultModel": "gpt-4o",
    "defaultTemperature": 0.7,
    "enableInlineAI": true,
    "enableAutoExtraction": true,
    "enableSuggestions": true
  },
  "notifications": {
    "emailDigest": "weekly",
    "aiInsights": true
  },
  "plan": {
    "type": "free",
    "aiSessionsUsed": 42,
    "aiSessionsLimit": 100,
    "storageUsedMB": 128,
    "storageLimitMB": 500
  }
}
```

### 11.2. Update User Settings

```typescript
// Server Action
async function updateUserSettings(data: Partial<UserSettings>): Promise<UserSettings>
```

**Input (partial update):**
```json
{
  "preferences": {
    "theme": "dark",
    "editorFontSize": 20
  },
  "ai": {
    "defaultModel": "claude-sonnet-4-20250514",
    "enableAutoExtraction": false
  }
}
```

### 11.3. Update Profile

```typescript
// Server Action
async function updateProfile(data: UpdateProfileInput): Promise<User>
```

**Input:**
```json
{
  "name": "Elias Vance",
  "avatarUrl": "https://...",
  "bio": "Sci-fi novelist and eternal archivist"
}
```

### 11.4. Delete Account

```typescript
// Server Action
async function deleteAccount(): Promise<void>
```

**Response:** `204` No Content  
**Side Effects:** All user data permanently deleted (workspaces, documents, AI history, embeddings)

> ⚠️ **Requires confirmation**: Client must send `confirm: "DELETE MY ACCOUNT"` string.

---

## 12. 📊 Analytics & Usage

> **Implementation**: Server Actions  
> **Purpose**: Dashboard stats, AI cost tracking, writing metrics

### 12.1. Get Workspace Stats

```typescript
// Server Action
async function getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats>
```

**Response:**
```json
{
  "documents": {
    "total": 24,
    "byType": {
      "doc": 15,
      "character": 5,
      "setting": 3,
      "plot": 1
    },
    "byStatus": {
      "draft": 12,
      "revision": 5,
      "finished": 4,
      "idea": 3
    }
  },
  "content": {
    "totalWords": 48200,
    "totalBlocks": 892,
    "totalLinks": 67,
    "averageDocLength": 2008
  },
  "ai": {
    "totalSessions": 42,
    "totalTokensUsed": 128500,
    "estimatedCost": 0.38,
    "topContextDocuments": [
      { "id": "...", "title": "Chapter 3", "referenceCount": 12 }
    ]
  },
  "activity": {
    "lastWrittenAt": "2026-04-17T04:30:00.000Z",
    "wordsThisWeek": 3400,
    "wordsLastWeek": 2800,
    "streak": 5
  }
}
```

### 12.2. Get Writing Activity

```typescript
// Server Action
async function getWritingActivity(params: ActivityInput): Promise<ActivityData[]>
```

**Input:**
```json
{
  "workspaceId": "01913a3b-...",
  "range": "30d",
  "granularity": "day"
}
```

**Response:**
```json
{
  "data": [
    { "date": "2026-04-17", "wordsWritten": 1200, "sessionsCount": 3 },
    { "date": "2026-04-16", "wordsWritten": 850, "sessionsCount": 2 }
  ]
}
```

---

## 13. 🛡️ Rate Limiting

Rate limits are enforced via `@upstash/ratelimit` middleware.

| Endpoint | Free Plan | Pro Plan | Window |
|----------|-----------|----------|--------|
| `/api/chat` | 20 req/min | 60 req/min | Sliding |
| `/api/ai/inline` | 30 req/min | 100 req/min | Sliding |
| `/api/ingest` | 10 req/min | 30 req/min | Fixed |
| `/api/sync` | 60 req/min | 120 req/min | Sliding |
| Server Actions (general) | 100 req/min | 300 req/min | Sliding |

**Rate Limit Response:** `429`
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please slow down.",
    "retryAfter": 32
  }
}
```

**Headers:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1713358200
Retry-After: 32
```

---

## 14. 🔐 Security Considerations

### 14.1. Authentication Flow
```
Client → Middleware (Edge) → Verify JWT → Next.js Server → Drizzle → NeonDB (RLS)
```

### 14.2. Row Level Security
All queries pass through RLS policies. Even if application code has a bug, the database enforces:
- Users can only access their own workspaces
- Documents, blocks, links, chunks are scoped through workspace ownership
- AI conversations are user-scoped

### 14.3. Input Validation
- All Server Actions validate input via **Zod schemas**
- API Route Handlers parse and validate with Zod before processing
- File uploads: max 5MB per file, allowed extensions: `.md`, `.json`, `.txt`
- AI prompts: max 4000 chars, sanitized for injection

### 14.4. Data Privacy
- Raw AI prompts/outputs auto-deleted after 30 days
- Telemetry disabled on Free plan
- No third-party analytics on document content
- Embeddings are mathematical vectors — not reversible to original text

---

## 15. 📋 TypeScript Type Definitions

> Reference types for client-side and server-side usage.

```typescript
// ============================================
// Core Entity Types
// ============================================

type UUID = string; // UUID v7

type Plan = "free" | "pro" | "team";
type DocType = "doc" | "character" | "setting" | "plot";
type DocStatus = "draft" | "revision" | "finished" | "idea";
type LinkType = "mention" | "reference" | "plot-link" | "character-link";
type MessageRole = "user" | "assistant" | "system";
type ContextType = "full-project" | "folder" | "document";
type AIMode = "prose" | "analysis" | "roleplay";
type ExportFormat = "markdown" | "json";
type InlineAction = 
  | "continue" | "rewrite" | "expand" | "shorten" 
  | "change-tone" | "fix-grammar" | "translate" | "custom";

interface User {
  id: UUID;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: UUID;
  ownerId: UUID;
  name: string;
  settings: Record<string, unknown>;
  documentCount?: number;
  createdAt: string;
}

interface Document {
  id: UUID;
  workspaceId: UUID;
  parentId: UUID | null;
  title: string;
  type: DocType;
  status: DocStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Block {
  id: UUID;
  documentId: UUID;
  type: string;
  content: Record<string, unknown>; // BlockNote JSON
  sortOrder: number;
  parentBlockId: UUID | null;
  createdAt: string;
}

interface DocumentLink {
  id: UUID;
  sourceId: UUID;
  targetId: UUID;
  type: LinkType;
  createdAt: string;
}

interface DocumentChunk {
  id: UUID;
  documentId: UUID;
  blockId: UUID;
  content: string;
  metadata: Record<string, unknown>;
  tokenCount: number;
  createdAt: string;
}

interface AIConversation {
  id: UUID;
  userId: UUID;
  title: string;
  contextType: ContextType;
  messageCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface AIMessage {
  id: UUID;
  conversationId: UUID;
  role: MessageRole;
  content: string;
  citations: Citation[];
  tokenUsage: TokenUsage | null;
  createdAt: string;
}

interface Citation {
  id: string;
  documentId: UUID;
  title: string;
  excerpt: string;
  blockId: UUID | null;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  cached?: boolean;
}

// ============================================
// API Input Types
// ============================================

interface SyncBlocksInput {
  documentId: UUID;
  version: number;
  operations: BlockOperation[];
}

interface BlockOperation {
  op: "insert" | "update" | "delete" | "move";
  block?: Block;
  blockId?: UUID;
  changes?: Partial<Block>;
  newSortOrder?: number;
  newParentBlockId?: UUID | null;
}

interface ChatInput {
  conversationId: UUID | null;
  message: string;
  context: {
    type: ContextType;
    workspaceId: UUID;
    documentIds?: UUID[];
    folderId?: UUID;
  };
  options?: {
    model?: string;
    mode?: AIMode;
    characterId?: UUID | null;
    temperature?: number;
    maxTokens?: number;
  };
}

interface InlineAIInput {
  documentId: UUID;
  selectedText: string;
  action: InlineAction;
  surroundingContext?: {
    before: string;
    after: string;
  };
  customPrompt?: string | null;
  toneTarget?: string;
  targetLang?: string;
}

interface SemanticSearchInput {
  workspaceId: UUID;
  query: string;
  filters?: {
    documentTypes?: DocType[];
    documentIds?: UUID[];
    dateRange?: { from: string; to: string };
  };
  topK?: number;
  threshold?: number;
}

// ============================================
// Pagination
// ============================================

interface PaginationInput {
  cursor?: UUID | null;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: UUID | null;
    hasMore: boolean;
    total: number;
  };
}
```

---

## 16. 📊 Endpoint Summary Matrix

| # | Domain | Method | Path / Action | Auth | Rate Limit | Response |
|---|--------|--------|---------------|------|------------|----------|
| 1 | Auth | `GET` | `/api/auth/session` | ❌ | — | JSON |
| 2 | Auth | `POST` | `/api/auth/signin/:provider` | ❌ | — | Redirect |
| 3 | Auth | Action | `getCurrentUser()` | ✅ | General | JSON |
| 4 | Workspace | Action | `listWorkspaces()` | ✅ | General | JSON |
| 5 | Workspace | Action | `createWorkspace()` | ✅ | General | JSON |
| 6 | Workspace | Action | `updateWorkspace()` | ✅ | General | JSON |
| 7 | Workspace | Action | `deleteWorkspace()` | ✅ | General | `204` |
| 8 | Document | Action | `listDocuments()` | ✅ | General | JSON (paginated) |
| 9 | Document | Action | `getDocument()` | ✅ | General | JSON |
| 10 | Document | Action | `createDocument()` | ✅ | General | JSON |
| 11 | Document | Action | `updateDocument()` | ✅ | General | JSON |
| 12 | Document | Action | `deleteDocument()` | ✅ | General | `204` |
| 13 | Document | Action | `getDocumentTree()` | ✅ | General | JSON |
| 14 | Blocks | `POST` | `/api/sync` | ✅ | 60-120/min | JSON |
| 15 | Blocks | Action | `getBlocks()` | ✅ | General | JSON |
| 16 | Links | Action | `createLink()` | ✅ | General | JSON |
| 17 | Links | Action | `deleteLink()` | ✅ | General | `204` |
| 18 | Links | Action | `getBacklinks()` | ✅ | General | JSON |
| 19 | Links | Action | `searchDocumentsForLink()` | ✅ | General | JSON |
| 20 | Links | Action | `getLinkPreview()` | ✅ | General | JSON |
| 21 | AI Chat | `POST` | `/api/chat` | ✅ | 20-60/min | SSE Stream |
| 22 | AI Chat | Action | `listConversations()` | ✅ | General | JSON (paginated) |
| 23 | AI Chat | Action | `getConversationMessages()` | ✅ | General | JSON (paginated) |
| 24 | AI Chat | Action | `deleteConversation()` | ✅ | General | `204` |
| 25 | AI Chat | Action | `renameConversation()` | ✅ | General | JSON |
| 26 | Inline AI | `POST` | `/api/ai/inline` | ✅ | 30-100/min | SSE Stream |
| 27 | Inline AI | Action | `applyAIResult()` | ✅ | General | `200` |
| 28 | Ingest | `POST` | `/api/ingest` | ✅ | 10-30/min | JSON `202` |
| 29 | Ingest | Action | `getIngestionStatus()` | ✅ | General | JSON |
| 30 | Ingest | Action | `reindexWorkspace()` | ✅ | General | JSON `202` |
| 31 | Search | Action | `semanticSearch()` | ✅ | General | JSON |
| 32 | Search | Action | `getKnowledgeGraph()` | ✅ | General | JSON |
| 33 | Search | Action | `extractEntities()` | ✅ | General | JSON |
| 34 | Export | Action | `exportDocument()` | ✅ | General | JSON |
| 35 | Export | Action | `exportWorkspace()` | ✅ | General | JSON (download URL) |
| 36 | Import | Action | `importDocument()` | ✅ | General | JSON |
| 37 | Import | Action | `bulkImport()` | ✅ | General | JSON |
| 38 | Settings | Action | `getUserSettings()` | ✅ | General | JSON |
| 39 | Settings | Action | `updateUserSettings()` | ✅ | General | JSON |
| 40 | Settings | Action | `updateProfile()` | ✅ | General | JSON |
| 41 | Settings | Action | `deleteAccount()` | ✅ | General | `204` |
| 42 | Analytics | Action | `getWorkspaceStats()` | ✅ | General | JSON |
| 43 | Analytics | Action | `getWritingActivity()` | ✅ | General | JSON |

**Tổng cộng: 43 endpoints** (4 Route Handlers + 39 Server Actions)

---

*Document auto-generated from ScribeSoul Technical Spec v1.0, Database Schema v1.0, and PRD UI/UX Spec.*
