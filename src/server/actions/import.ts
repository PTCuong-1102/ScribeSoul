"use server"

import { db } from "@/lib/db"
import { blocks } from "@/lib/db/schema/blocks"
import { createDocument } from "./documents"

interface InlineContent {
  type: "text";
  text: string;
  styles: {
    bold?: boolean;
    italic?: boolean;
  };
}

function parseInlineStyles(text: string): InlineContent[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);
  const result = parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return {
        type: "text" as const,
        text: part.slice(2, -2),
        styles: { bold: true }
      };
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return {
        type: "text" as const,
        text: part.slice(1, -1),
        styles: { italic: true }
      };
    } else if (part.startsWith('_') && part.endsWith('_')) {
      return {
        type: "text" as const,
        text: part.slice(1, -1),
        styles: { italic: true }
      };
    } else {
      return {
        type: "text" as const,
        text: part,
        styles: {}
      };
    }
  }).filter(p => p.text.length > 0);

  if (result.length === 0) {
    return [{ type: "text", text: "", styles: {} }];
  }
  return result;
}

interface MarkdownBlock {
  type: string;
  props: Record<string, unknown>;
  content: InlineContent[];
  sortOrder: number;
}

function markdownToBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.split('\n');
  const blocksList: MarkdownBlock[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      blocksList.push({
        type: "heading",
        props: { level },
        content: parseInlineStyles(headingText),
        sortOrder: index
      });
      return;
    }

    // Bullet list items
    const bulletMatch = line.match(/^([-\*\+])\s+(.*)$/);
    if (bulletMatch) {
      const listText = bulletMatch[2];
      blocksList.push({
        type: "bulletListItem",
        props: {},
        content: parseInlineStyles(listText),
        sortOrder: index
      });
      return;
    }

    // Numbered list items
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const listText = numberedMatch[2];
      blocksList.push({
        type: "numberedListItem",
        props: {},
        content: parseInlineStyles(listText),
        sortOrder: index
      });
      return;
    }

    // Default paragraph
    blocksList.push({
      type: "paragraph",
      props: {},
      content: parseInlineStyles(line),
      sortOrder: index
    });
  });

  return blocksList;
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
        type: b.type,
        props: b.props,
        content: b.content,
        sortOrder: b.sortOrder,
        documentId: newDoc.id
      }))
    );
  }

  return newDoc;
}
