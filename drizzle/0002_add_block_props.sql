-- Alter table block to add props column
ALTER TABLE "block" ADD COLUMN IF NOT EXISTS "props" jsonb DEFAULT '{}'::jsonb NOT NULL;
