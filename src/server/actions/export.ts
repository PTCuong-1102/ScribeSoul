"use server"

import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq, asc } from "drizzle-orm"
import { auth } from "@/lib/auth/server"
import type { BlockContent, BlockContentItem } from "@/lib/ai/chunker"

interface BlockData {
  type: string;
  content?: BlockContent;
  props?: Record<string, unknown>;
}

function blocksToMarkdown(documentBlocks: BlockData[]): string {
  return documentBlocks.map(block => {
    const content = block.content
    const text = Array.isArray(content)
      ? content.map((c: BlockContentItem) => c.text || "").join('')
      : typeof content === 'string' ? content : ''

    switch (block.type) {
      case "heading": {
        const level = typeof block.props?.level === 'number'
          ? block.props.level
          : 2;
        return `${"#".repeat(level)} ${text}\n\n`;
      }
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
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { workspace: true }
  })
  if (!doc) throw new Error("Document not found");
  if (doc.workspace.ownerId !== session.user.id) throw new Error("Forbidden");

  const rawBlocks = await db.query.blocks.findMany({
    where: eq(blocks.documentId, documentId),
    orderBy: [asc(blocks.sortOrder)]
  })

  const docBlocks: BlockData[] = rawBlocks.map(b => ({
    type: b.type,
    content: b.content as BlockContent | undefined,
    props: b.props as Record<string, unknown> | undefined,
  }))

  const content = blocksToMarkdown(docBlocks);
  const frontmatter = `---
title: ${JSON.stringify(doc.title)}
type: ${doc.type}
status: ${doc.status}
date: ${doc.updatedAt.toISOString()}
---

`;

  return frontmatter + content;
}
