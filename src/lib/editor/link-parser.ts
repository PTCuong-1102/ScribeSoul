
export interface ExtractedLink {
  title: string;
  id?: string;
}

/**
 * Extracts all [[Document Title]] or [[Document Title|id]] from BlockNote blocks.
 * BlockNote stores content as JSON, so we need to traverse the text properties.
 */
export function extractLinks(blocks: unknown[]): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const linkRegex = /\[\[(.*?)\]\]/g;

  function traverse(obj: unknown) {
    if (!obj) return;

    if (typeof obj === 'string') {
      let match;
      while ((match = linkRegex.exec(obj)) !== null) {
        const content = match[1];
        if (content.includes('|')) {
          const [title, id] = content.split('|');
          links.push({ title: title.trim(), id: id.trim() });
        } else {
          links.push({ title: content.trim() });
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        // Skip keys that definitely don't contain text content if needed, 
        // but for robustness we traverse all.
        traverse((obj as Record<string, unknown>)[key]);
      });
    }
  }

  traverse(blocks);
  return links;
}
