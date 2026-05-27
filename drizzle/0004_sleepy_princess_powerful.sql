
CREATE INDEX "workspace_owner_idx" ON "workspace" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "block_parent_idx" ON "block" USING btree ("parent_block_id");--> statement-breakpoint
CREATE INDEX "conv_workspace_idx" ON "ai_conversation" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "msg_conversation_idx" ON "ai_message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "chunk_block_idx" ON "document_chunk" USING btree ("block_id");