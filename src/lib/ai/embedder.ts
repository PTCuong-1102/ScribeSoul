import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { AI_CONFIG } from "./config";

/**
 * Generates embeddings for a single string or an array of strings.
 * Uses text-embedding-3-small (1536 dimensions).
 */
export async function generateEmbeddings(values: string[]) {
  const { embeddings } = await embedMany({
    model: openai.embedding(AI_CONFIG.embeddingModel),
    values,
  });
  return embeddings;
}

export async function generateEmbedding(value: string) {
  const { embedding } = await embed({
    model: openai.embedding(AI_CONFIG.embeddingModel),
    value,
  });
  return embedding;
}
