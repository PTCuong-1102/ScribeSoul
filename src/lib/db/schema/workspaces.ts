import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"
import { users } from "./users"

export const workspaces = pgTable("workspace", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
