/**
 * Simple chunking strategy for creative writing.
 * Groups blocks into chunks of ~600 tokens with overlap.
 */
export interface Chunk {
  content: string;
  metadata: {
    docId: string;
    blockIds: string[];
    startIndex: number;
  };
}

interface BasicBlock {
  id: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  content: any;
  [key: string]: unknown;
}

export function chunkBlocks(docId: string, blocks: BasicBlock[], maxTokens = 600, overlap = 100): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunkText = "";
  let currentBlockIds: string[] = [];
  
  // Rough token estimation (4 chars per token)
  const getCharLimit = () => maxTokens * 4;
  const getOverlapLimit = () => overlap * 4;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    // Simplification: just use plain text if possible
    const plainText = Array.isArray(block.content) 
      ? block.content.map((c) => c.text || "").join(' ')
      : typeof block.content === 'string' ? block.content : "";

    if (currentChunkText.length + plainText.length > getCharLimit()) {
      // Save current chunk
      chunks.push({
        content: currentChunkText.trim(),
        metadata: {
          docId,
          blockIds: [...currentBlockIds],
          startIndex: i - currentBlockIds.length
        }
      });

      // Start next chunk with overlap
      const overlapText = currentChunkText.slice(-getOverlapLimit());
      currentChunkText = overlapText + " " + plainText;
      currentBlockIds = [block.id]; // Simplified ID tracking for overlapping blocks
    } else {
      currentChunkText += (currentChunkText ? " " : "") + plainText;
      currentBlockIds.push(block.id);
    }
  }

  // Last chunk
  if (currentChunkText.trim()) {
    chunks.push({
      content: currentChunkText.trim(),
      metadata: {
        docId,
        blockIds: currentBlockIds,
        startIndex: blocks.length - currentBlockIds.length
      }
    });
  }

  return chunks;
}
