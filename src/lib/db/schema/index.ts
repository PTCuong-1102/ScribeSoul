import { relations } from "drizzle-orm"
import * as usersSchema from "./users"
import * as workspacesSchema from "./workspaces"
import * as documentsSchema from "./documents"
import * as blocksSchema from "./blocks"
import * as aiSchema from "./ai"
import * as linksSchema from "./links"


export * from "./users"
export * from "./workspaces"
export * from "./documents"
export * from "./blocks"
export * from "./links"
export * from "./ai"
export * from "./ingest_queue"

// Relations
export const userRelations = relations(usersSchema.users, ({ many }) => ({
  workspaces: many(workspacesSchema.workspaces),
  conversations: many(aiSchema.aiConversations),
}))

export const workspaceRelations = relations(workspacesSchema.workspaces, ({ one, many }) => ({
  owner: one(usersSchema.users, {
    fields: [workspacesSchema.workspaces.ownerId],
    references: [usersSchema.users.id],
  }),
  documents: many(documentsSchema.documents),
}))

export const documentRelations = relations(documentsSchema.documents, ({ one, many }) => ({
  workspace: one(workspacesSchema.workspaces, {
    fields: [documentsSchema.documents.workspaceId],
    references: [workspacesSchema.workspaces.id],
  }),
  parent: one(documentsSchema.documents, {
    fields: [documentsSchema.documents.parentId],
    references: [documentsSchema.documents.id],
    relationName: "document_tree",
  }),
  children: many(documentsSchema.documents, { relationName: "document_tree" }),
  blocks: many(blocksSchema.blocks),
  outgoingLinks: many(linksSchema.documentLinks, { relationName: "link_source" }),
  incomingLinks: many(linksSchema.documentLinks, { relationName: "link_target" }),
}))

export const blockRelations = relations(blocksSchema.blocks, ({ one }) => ({
  document: one(documentsSchema.documents, {
    fields: [blocksSchema.blocks.documentId],
    references: [documentsSchema.documents.id],
  }),
}))

export const conversationRelations = relations(aiSchema.aiConversations, ({ one, many }) => ({
  user: one(usersSchema.users, {
    fields: [aiSchema.aiConversations.userId],
    references: [usersSchema.users.id],
  }),
  messages: many(aiSchema.aiMessages),
}))

export const messageRelations = relations(aiSchema.aiMessages, ({ one }) => ({
  conversation: one(aiSchema.aiConversations, {
    fields: [aiSchema.aiMessages.conversationId],
    references: [aiSchema.aiConversations.id],
  }),
}))

export const documentLinkRelations = relations(linksSchema.documentLinks, ({ one }) => ({
  source: one(documentsSchema.documents, {
    fields: [linksSchema.documentLinks.sourceId],
    references: [documentsSchema.documents.id],
    relationName: "link_source",
  }),
  target: one(documentsSchema.documents, {
    fields: [linksSchema.documentLinks.targetId],
    references: [documentsSchema.documents.id],
    relationName: "link_target",
  }),
}))

export const documentChunkRelations = relations(aiSchema.documentChunks, ({ one, many }) => ({
  document: one(documentsSchema.documents, {
    fields: [aiSchema.documentChunks.documentId],
    references: [documentsSchema.documents.id],
  }),
  embeddings: many(aiSchema.chunkEmbeddings),
}))

export const chunkEmbeddingRelations = relations(aiSchema.chunkEmbeddings, ({ one }) => ({
  chunk: one(aiSchema.documentChunks, {
    fields: [aiSchema.chunkEmbeddings.chunkId],
    references: [aiSchema.documentChunks.id],
  }),
}))
