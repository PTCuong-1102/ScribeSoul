import { pgTable, text, timestamp, uuid, jsonb, integer, index, unique } from "drizzle-orm/pg-core"
import { documents } from "./documents"

export const blocks = pgTable("block", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // BlockNote block type (paragraph, heading, etc)
  content: jsonb("content").default({}).notNull(),
  sortOrder: integer("sort_order").notNull(),
  parentBlockId: uuid("parent_block_id"), // For nested blocks
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  docIdx: index("block_doc_idx").on(table.documentId),
  orderIdx: index("block_order_idx").on(table.sortOrder),
  docOrderUnique: unique("doc_sort_order_unique").on(table.documentId, table.sortOrder),
}))
