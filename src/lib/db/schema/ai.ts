import { pgTable, text, timestamp, uuid, jsonb, integer, index, customType } from "drizzle-orm/pg-core"
import { users } from "./users"
import { workspaces } from "./workspaces"
import { documents } from "./documents"
import { blocks } from "./blocks"

// Custom type for pgvector (1536 dimensions for text-embedding-3-small)
const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(1536)"
  },
})

export const documentChunks = pgTable("document_chunk", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  blockId: uuid("block_id")
    .references(() => blocks.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  docIdx: index("chunk_doc_idx").on(table.documentId),
}))

export const chunkEmbeddings = pgTable("chunk_embedding", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  chunkId: uuid("chunk_id")
    .notNull()
    .references(() => documentChunks.id, { onDelete: "cascade" }),
  embedding: vector("embedding").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  chunkIdx: index("embedding_chunk_idx").on(table.chunkId),
}))

export const aiConversations = pgTable("ai_conversation", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").default("New Conversation").notNull(),
  contextType: text("context_type", { enum: ["full-project", "folder", "document"] })
    .default("full-project")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const aiMessages = pgTable("ai_message", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").default([]).notNull(),
  tokenUsage: jsonb("token_usage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
