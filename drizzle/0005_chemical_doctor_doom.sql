CREATE TABLE "pending_ingest" (
	"document_id" uuid PRIMARY KEY NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pending_ingest" ADD CONSTRAINT "pending_ingest_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pending_ingest_sched_idx" ON "pending_ingest" USING btree ("scheduled_at");