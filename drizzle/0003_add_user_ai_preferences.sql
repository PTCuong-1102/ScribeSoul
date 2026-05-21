-- Alter table "user" to add ai_preferences column
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ai_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL;
