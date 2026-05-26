import { pgTable, timestamp, uuid, index } from "drizzle-orm/pg-core"
import { documents } from "./documents"

export const pendingIngests = pgTable("pending_ingest", {
  documentId: uuid("document_id")
    .notNull()
    .primaryKey()
    .references(() => documents.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  schedIdx: index("pending_ingest_sched_idx").on(table.scheduledAt),
}))
