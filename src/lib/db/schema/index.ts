import { relations } from "drizzle-orm"
import * as usersSchema from "./users"
import * as workspacesSchema from "./workspaces"
import * as documentsSchema from "./documents"
import * as blocksSchema from "./blocks"
import * as aiSchema from "./ai"

export * from "./users"
export * from "./workspaces"
export * from "./documents"
export * from "./blocks"
export * from "./links"
export * from "./ai"

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
