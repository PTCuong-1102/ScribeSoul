"use server"

import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, asc } from "drizzle-orm"

/**
 * Converts BlockNote JSON blocks to a basic Markdown string.
 */
function blocksToMarkdown(documentBlocks: any[]): string {
  return documentBlocks.map(block => {
    const text = block.content?.map((c: any) => c.text).join('') || '';
    
    switch (block.type) {
      case "heading":
        return `## ${text}\n\n`;
      case "paragraph":
        return `${text}\n\n`;
      case "bulletListItem":
        return `- ${text}\n`;
      case "numberedListItem":
        return `1. ${text}\n`;
      default:
        return `${text}\n\n`;
    }
  }).join('').trim();
}

export async function exportDocumentAsMarkdown(documentId: string) {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId)
  })
  if (!doc) throw new Error("Document not found");

  const docBlocks = await db.query.blocks.findMany({
    where: eq(blocks.documentId, documentId),
    orderBy: [asc(blocks.sortOrder)]
  })

  const content = blocksToMarkdown(docBlocks);
  const frontmatter = `---
title: ${doc.title}
type: ${doc.type}
status: ${doc.status}
date: ${doc.updatedAt.toISOString()}
---

`;

  return frontmatter + content;
}
