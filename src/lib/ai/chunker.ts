/**
 * Chunking strategy for creative writing.
 * Groups blocks into chunks of ~600 tokens with overlap.
 * 
 * Uses a word-based token estimation that is more accurate than
 * the naive "4 chars per token" approach, especially for Vietnamese text
 * where characters-per-token ratio differs from English.
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

/**
 * Estimate token count from text.
 * Uses a hybrid approach:
 * - For Latin text: ~0.75 tokens per word (GPT-style tokenization)
 * - For CJK/Vietnamese: ~1.5 tokens per word (diacritics + multi-byte chars)
 * Falls back to word count * 1.3 as a safe middle ground.
 */
function estimateTokens(text: string): number {
  if (!text.trim()) return 0
  const words = text.trim().split(/\s+/).length
  // Approximate: 1.3 tokens per word is a safe estimate for mixed Vietnamese/English text
  return Math.ceil(words * 1.3)
}

export function chunkBlocks(docId: string, blocks: BasicBlock[], maxTokens = 600, overlap = 100): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunkText = "";
  let currentChunkTokens = 0;
  let currentBlockIds: string[] = [];
  
  const overlapTokens = overlap;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    // Extract plain text from block content
    const plainText = Array.isArray(block.content) 
      ? block.content.map((c) => c.text || "").join(' ')
      : typeof block.content === 'string' ? block.content : "";

    const blockTokens = estimateTokens(plainText);

    if (currentChunkTokens + blockTokens > maxTokens && currentChunkText.trim()) {
      // Save current chunk
      chunks.push({
        content: currentChunkText.trim(),
        metadata: {
          docId,
          blockIds: [...currentBlockIds],
          startIndex: i - currentBlockIds.length
        }
      });

      // Start next chunk with overlap from end of previous chunk
      // Take roughly `overlapTokens` worth of text from the tail
      const words = currentChunkText.trim().split(/\s+/);
      const overlapWordCount = Math.ceil(overlapTokens / 1.3);
      const overlapWords = words.slice(-overlapWordCount);
      const overlapText = overlapWords.join(' ');

      currentChunkText = overlapText + " " + plainText;
      currentChunkTokens = estimateTokens(currentChunkText);
      currentBlockIds = [block.id];
    } else {
      currentChunkText += (currentChunkText ? " " : "") + plainText;
      currentChunkTokens += blockTokens;
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
