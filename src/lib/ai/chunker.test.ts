import { describe, it, expect } from "vitest"
import { chunkBlocks } from "./chunker"

interface TestBlock {
  id: string
  content: Array<{ text?: string }> | string
  type: string
  [key: string]: unknown
}

describe("chunkBlocks", () => {
  const docId = "test-doc-id"

  it("returns empty array for empty blocks", () => {
    const result = chunkBlocks(docId, [])
    expect(result).toEqual([])
  })

  it("creates a single chunk for few small blocks", () => {
    const blocks: TestBlock[] = [
      { id: "b1", content: [{ text: "Hello" }], type: "paragraph" },
      { id: "b2", content: [{ text: "World" }], type: "paragraph" },
    ]
    const result = chunkBlocks(docId, blocks)
    expect(result).toHaveLength(1)
    expect(result[0].content).toContain("Hello")
    expect(result[0].content).toContain("World")
    expect(result[0].metadata.blockIds).toEqual(["b1", "b2"])
  })

  it("splits into multiple chunks when exceeding maxTokens", () => {
    const blocks: TestBlock[] = Array.from({ length: 20 }, (_, i) => ({
      id: `b${i}`,
      content: [{ text: "word ".repeat(50) }],
      type: "paragraph",
    }))
    const result = chunkBlocks(docId, blocks, 100)
    expect(result.length).toBeGreaterThan(1)
  })

  it("handles empty block content gracefully", () => {
    const blocks: TestBlock[] = [
      { id: "b1", content: [], type: "paragraph" },
      { id: "b2", content: [{ text: "" }], type: "paragraph" },
    ]
    const result = chunkBlocks(docId, blocks)
    expect(result).toHaveLength(0)
  })

  it("extracts text from array content", () => {
    const blocks: TestBlock[] = [
      { id: "b1", content: [{ text: "First " }, { text: "Second" }], type: "paragraph" },
    ]
    const result = chunkBlocks(docId, blocks)
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe("First  Second")
  })
})
