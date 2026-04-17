"use server"

import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { documents } from "@/lib/db/schema/documents"
import { eq } from "drizzle-orm"
import { createDocument } from "./documents"

/**
 * Very basic Markdown to BlockNote JSON converter.
 * In a real app, this would use a proper MDAST parser.
 */
function markdownToBlocks(markdown: string) {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  
  lines.forEach((line, index) => {
    if (!line.trim()) return;

    if (line.startsWith('## ')) {
      blocks.push({
        type: "heading",
        content: [{ type: "text", text: line.replace('## ', ''), styles: {} }],
        sortOrder: index
      });
    } else {
      blocks.push({
        type: "paragraph",
        content: [{ type: "text", text: line, styles: {} }],
        sortOrder: index
      });
    }
  });

  return blocks;
}

export async function importMarkdown(workspaceId: string, title: string, markdown: string) {
  const newDoc = await createDocument({
    workspaceId,
    title,
    type: "doc",
    status: "draft",
    parentId: null,
    metadata: {}
  });

  const importedBlocks = markdownToBlocks(markdown);
  
  if (importedBlocks.length > 0) {
    await db.insert(blocks).values(
      importedBlocks.map(b => ({
        ...b,
        documentId: newDoc.id
      }))
    );
  }

  return newDoc;
}
