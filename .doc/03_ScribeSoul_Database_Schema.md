```markdown

\\# 🗃️ ScribeSoul - Database Schema (NeonDB + pgvector)



\\## 📐 Quy ước

\\- UUID v7 cho primary keys (tối ưu index, phân tán)

\\- `created\\\_at`, `updated\\\_at` tự động cập nhật

\\- Bật `pgvector` \\\& `hstore` extension

\\- RLS bật trên mọi bảng user-specific

\\- ORM: `drizzle-orm` (type-safe, hỗ trợ NeonDB tốt)



\\## 🔧 Extension Setup (Chạy 1 lần trên Neon Console)

```sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "vector";

ALTER USER neon\\\_superuser SET search\\\_path TO "$user", public, vector;

```



\## 📊 Core Schema (SQL/Drizzle Compatible)



\### 1. Users \& Auth

```sql

CREATE TABLE users (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; email VARCHAR(255) UNIQUE NOT NULL,

\&#x20; name VARCHAR(100),

\&#x20; avatar\\\_url TEXT,

\&#x20; plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW(),

\&#x20; updated\\\_at TIMESTAMPTZ DEFAULT NOW()

);



\\-- Auth.js tables (nếu dùng DrizzleAdapter)

CREATE TABLE accounts (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; user\\\_id UUID REFERENCES users(id) ON DELETE CASCADE,

\&#x20; type VARCHAR(32) NOT NULL,

\&#x20; provider VARCHAR(32) NOT NULL,

\&#x20; provider\\\_account\\\_id VARCHAR(255) NOT NULL,

\&#x20; refresh\\\_token TEXT,

\&#x20; access\\\_token TEXT,

\&#x20; expires\\\_at BIGINT,

\&#x20; token\\\_type TEXT,

\&#x20; scope TEXT,

\&#x20; id\\\_token TEXT,

\&#x20; session\\\_state TEXT

);



CREATE TABLE sessions (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; session\\\_token VARCHAR(255) UNIQUE NOT NULL,

\&#x20; user\\\_id UUID REFERENCES users(id) ON DELETE CASCADE,

\&#x20; expires TIMESTAMPTZ NOT NULL

);

```



\### 2. Workspaces \& Documents

```sql

CREATE TABLE workspaces (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; owner\\\_id UUID REFERENCES users(id) ON DELETE CASCADE,

\&#x20; name VARCHAR(100) NOT NULL,

\&#x20; settings JSONB DEFAULT '{}',

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE documents (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; workspace\\\_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

\&#x20; parent\\\_id UUID REFERENCES documents(id) ON DELETE SET NULL,

\&#x20; title VARCHAR(255) DEFAULT 'Untitled',

\&#x20; type VARCHAR(30) DEFAULT 'doc' CHECK (type IN ('doc', 'character', 'setting', 'plot')),

\&#x20; status VARCHAR(20) DEFAULT 'draft',

\&#x20; metadata JSONB DEFAULT '{}',

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW(),

\&#x20; updated\\\_at TIMESTAMPTZ DEFAULT NOW()

);

```



\### 3. Blocks \& Content

```sql

CREATE TABLE blocks (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; document\\\_id UUID REFERENCES documents(id) ON DELETE CASCADE,

\&#x20; type VARCHAR(30) NOT NULL, -- 'paragraph', 'heading', 'image', 'ai-note', 'callout'

\&#x20; content JSONB NOT NULL,    -- BlockNote JSON structure

\&#x20; sort\\\_order INT NOT NULL,

\&#x20; parent\\\_block\\\_id UUID REFERENCES blocks(id) ON DELETE SET NULL,

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE UNIQUE INDEX idx\\\_blocks\\\_doc\\\_order ON blocks(document\\\_id, sort\\\_order);

```



\### 4. Bi-directional Links

```sql

CREATE TABLE document\\\_links (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; source\\\_id UUID REFERENCES documents(id) ON DELETE CASCADE,

\&#x20; target\\\_id UUID REFERENCES documents(id) ON DELETE CASCADE,

\&#x20; type VARCHAR(30) DEFAULT 'mention' CHECK (type IN ('mention', 'reference', 'plot-link', 'character-link')),

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW(),

\&#x20; UNIQUE(source\\\_id, target\\\_id)

);



CREATE INDEX idx\\\_links\\\_source ON document\\\_links(source\\\_id);

CREATE INDEX idx\\\_links\\\_target ON document\\\_links(target\\\_id); -- Dùng cho backlinks

```



\### 5. AI \& Vector Storage

```sql

CREATE TABLE document\\\_chunks (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; document\\\_id UUID REFERENCES documents(id) ON DELETE CASCADE,

\&#x20; block\\\_id UUID REFERENCES blocks(id) ON DELETE CASCADE,

\&#x20; content TEXT NOT NULL,

\&#x20; metadata JSONB DEFAULT '{}',

\&#x20; token\\\_count INT,

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE chunk\\\_embeddings (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; chunk\\\_id UUID REFERENCES document\\\_chunks(id) ON DELETE CASCADE,

\&#x20; embedding VECTOR(1536), -- text-embedding-3-small

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);



\\-- HNSW Index cho vector search nhanh

CREATE INDEX ON chunk\\\_embeddings USING hnsw (embedding vector\\\_cosine\\\_ops) WITH (m = 16, ef\\\_construction = 64);

```



\### 6. AI Conversations

```sql

CREATE TABLE ai\\\_conversations (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; user\\\_id UUID REFERENCES users(id) ON DELETE CASCADE,

\&#x20; title VARCHAR(255) DEFAULT 'New Chat',

\&#x20; context\\\_type VARCHAR(30) DEFAULT 'general',

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE ai\\\_messages (

\&#x20; id UUID PRIMARY KEY DEFAULT gen\\\_random\\\_uuid(),

\&#x20; conversation\\\_id UUID REFERENCES ai\\\_conversations(id) ON DELETE CASCADE,

\&#x20; role VARCHAR(10) CHECK (role IN ('user', 'assistant', 'system')),

\&#x20; content TEXT NOT NULL,

\&#x20; citations JSONB DEFAULT '\\\[]',

\&#x20; token\\\_usage JSONB,

\&#x20; created\\\_at TIMESTAMPTZ DEFAULT NOW()

);

```



\## 🛡️ Row Level Security (RLS) - Bật trên Neon

```sql

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own workspace docs" 

ON documents FOR ALL 

USING (workspace\\\_id IN (SELECT id FROM workspaces WHERE owner\\\_id = auth.uid()));



ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocks follow doc policy" 

ON blocks FOR ALL 

USING (document\\\_id IN (SELECT id FROM documents WHERE workspace\\\_id IN (SELECT id FROM workspaces WHERE owner\\\_id = auth.uid())));



\\-- Tương tự áp dụng cho links, chunks, embeddings, conversations

```



\## 🔄 Migration \& Backup Strategy

\- \*\*Migration\*\*: `drizzle-kit generate` → commit → `drizzle-kit migrate` trên CI

\- \*\*Backup\*\*: Neon auto-backup 24h. Export weekly `.sql` via `pg\\\_dump`

\- \*\*Data Retention\*\*:

&#x20; - Chunks: giữ 180 ngày hoặc đến khi doc xóa

&#x20; - AI messages: giữ 30 ngày (nén metadata, xóa raw prompt)

&#x20; - Embeddings: auto purge khi chunk xóa (ON DELETE CASCADE)



\## 💡 Lưu ý tối ưu NeonDB

\- Dùng \*\*Connection Pooler\*\* (`-pooler.neon.tech`) cho Next.js serverless

\- Giới hạn `max\\\_connections` = 20 cho MVP

\- Bật `statement\\\_timeout = 5s` cho AI query

\- Dùng `EXPLAIN ANALYZE` kiểm tra vector search trước khi lên prod

```



\\---




