import { relations } from "drizzle-orm"
import * as users from "./users"
import * as workspaces from "./workspaces"
import * as documents from "./documents"
import * as blocks from "./blocks"
import * as links from "./links"
import * as ai from "./ai"

export { users, workspaces, documents, blocks, links, ai }

// Relations
export const userRelations = relations(users.users, ({ many }) => ({
  workspaces: many(workspaces.workspaces),
  conversations: many(ai.aiConversations),
}))

export const workspaceRelations = relations(workspaces.workspaces, ({ one, many }) => ({
  owner: one(users.users, {
    fields: [workspaces.workspaces.ownerId],
    references: [users.users.id],
  }),
  documents: many(documents.documents),
}))

export const documentRelations = relations(documents.documents, ({ one, many }) => ({
  workspace: one(workspaces.workspaces, {
    fields: [documents.documents.workspaceId],
    references: [workspaces.workspaces.id],
  }),
  parent: one(documents.documents, {
    fields: [documents.documents.parentId],
    references: [documents.documents.id],
    relationName: "document_tree",
  }),
  children: many(documents.documents, { relationName: "document_tree" }),
  blocks: many(blocks.blocks),
}))

export const blockRelations = relations(blocks.blocks, ({ one }) => ({
  document: one(documents.documents, {
    fields: [blocks.blocks.documentId],
    references: [documents.documents.id],
  }),
}))

export const conversationRelations = relations(ai.aiConversations, ({ one, many }) => ({
  user: one(users.users, {
    fields: [ai.aiConversations.userId],
    references: [users.users.id],
  }),
  messages: many(ai.aiMessages),
}))

export const messageRelations = relations(ai.aiMessages, ({ one }) => ({
  conversation: one(ai.aiConversations, {
    fields: [ai.aiMessages.conversationId],
    references: [ai.aiConversations.id],
  }),
}))
