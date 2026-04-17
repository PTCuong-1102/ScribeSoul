import { pgTable, timestamp, uuid, pgEnum, unique, index } from "drizzle-orm/pg-core"
import { documents } from "./documents"

export const linkTypeEnum = pgEnum("link_type", ["mention", "reference", "plot-link", "character-link"])

export const documentLinks = pgTable("document_link", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  targetId: uuid("target_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  type: linkTypeEnum("type").default("mention").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sourceTargetUnique: unique("source_target_unique").on(table.sourceId, table.targetId),
  sourceIdx: index("link_source_idx").on(table.sourceId),
  targetIdx: index("link_target_idx").on(table.targetId),
}))
