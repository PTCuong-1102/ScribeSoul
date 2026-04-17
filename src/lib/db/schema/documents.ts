import { pgTable, text, timestamp, uuid, jsonb, index, pgEnum } from "drizzle-orm/pg-core"
import { workspaces } from "./workspaces"

export const docTypeEnum = pgEnum("doc_type", ["doc", "character", "setting", "plot"])
export const docStatusEnum = pgEnum("doc_status", ["draft", "revision", "finished", "idea"])

export const documents = pgTable("document", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"), // Recursive self-reference for tree structure
  title: text("title").default("Untitled").notNull(),
  type: docTypeEnum("type").default("doc").notNull(),
  status: docStatusEnum("status").default("draft").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index("doc_workspace_idx").on(table.workspaceId),
  parentIdx: index("doc_parent_idx").on(table.parentId),
}))
