"use client"

import React from 'react'
import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems, DefaultReactSuggestionItem } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"
import { useTheme } from "next-themes"
import { Sparkles, Wand2 } from "lucide-react"
import { 
  filterSuggestionItems
} from "@blocknote/core"

interface BlockEditorProps {
  documentId?: string
  initialContent?: PartialBlock[]
  onChange?: (blocks: PartialBlock[]) => void
  onSyncStateChange?: (state: "idle" | "saving" | "saved" | "error") => void
}

function extractTextFromBlockContent(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""

  return content
    .map((item) => {
      if (!item || typeof item !== "object") return ""
      const text = (item as { text?: unknown }).text
      return typeof text === "string" ? text : ""
    })
    .join(" ")
    .trim()
}

export default function BlockEditor({ documentId, initialContent, onChange, onSyncStateChange }: BlockEditorProps) {
  const { theme } = useTheme()
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const ingestTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  // Track previous block IDs to detect deletions
  const prevBlockIdsRef = React.useRef<Set<string>>(new Set())

  // Initialize prevBlockIdsRef from initial content
  React.useEffect(() => {
    if (initialContent) {
      const ids = new Set<string>()
      for (const b of initialContent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const id = (b as any).id
        if (typeof id === "string") ids.add(id)
      }
      prevBlockIdsRef.current = ids
    }
  }, [initialContent])

  const editor = useCreateBlockNote({
    initialContent: initialContent || [
      {
        type: "heading",
        content: "Bắt đầu chương mới của bạn...",
      },
      {
        type: "paragraph",
        content: "Hãy để ngôn từ dẫn dắt bạn khám phá những chân trời mới.",
      },
    ],
  });

  // Load custom slash menu items
  const slashMenuItems = [
    ...getDefaultReactSlashMenuItems(editor),
    {
      title: "Soul Write",
      aliases: ["ai", "write", "continue"],
      group: "AI Tools",
      icon: <Sparkles className="w-4 h-4 text-secondary" />,
      subtext: "Hãy để Soul Assistant viết tiếp ý tưởng của bạn",
      onItemClick: () => soulWrite(editor),
    },
      {
        title: "Soul Refine",
        aliases: ["ai", "improve", "polish"],
        group: "AI Tools",
        icon: <Wand2 className="w-4 h-4 text-primary" />,
        subtext: "Trau chuốt văn phong của đoạn này",
        onItemClick: () => soulRefine(editor),
      },
    ] as DefaultReactSuggestionItem[];

  /**
   * Trigger document ingestion (chunking + embedding) after sync.
   * Debounced to 5 seconds to avoid excessive API calls during rapid editing.
   */
  const triggerIngest = (docId: string) => {
    if (ingestTimeoutRef.current) clearTimeout(ingestTimeoutRef.current)
    ingestTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId })
        })
        
        // FIX 3: Check response status and log errors
        if (!response.ok) {
          console.error(`[INGEST_ERROR] Server returned ${response.status}: ${response.statusText}`)
          return
        }
      } catch (error) {
        console.error("[INGEST_TRIGGER]", error)
      }
    }, 5000)
  }

  // AI Autocomplete function
  const soulWrite = async (editor: BlockNoteEditor) => {
    const currentBlock = editor.getTextCursorPosition().block;
    const prevBlocks = editor.document.slice(0, editor.document.indexOf(currentBlock) + 1);
    const context = prevBlocks.map((b) => extractTextFromBlockContent(b.content)).join("\n");
    const currentText = extractTextFromBlockContent(currentBlock.content)
    
    // Insert a temporary "AI is writing..." block or similar
    const loadingBlock: PartialBlock = {
      type: "paragraph",
      content: [{ type: "text", text: "Soul Assistant đang suy nghĩ...", styles: {} }],
    };
    editor.insertBlocks([loadingBlock], currentBlock, "after");
    const newBlock = editor.getTextCursorPosition().block;

    try {
      const response = await fetch("/api/ai/autocomplete", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: currentText,
          context 
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        
        // Update the block content using InlineContent[] format
        editor.updateBlock(newBlock, {
          type: "paragraph",
          content: [{ type: "text", text: fullText, styles: {} }],
        });
      }
    } catch (error) {
       console.error("AI Error:", error);
       editor.updateBlock(newBlock, {
         content: [{ type: "text", text: "Lỗi khi kết nối với Soul Assistant.", styles: {} }],
       });
    }
  }

  const soulRefine = async (editor: BlockNoteEditor) => {
    const currentBlock = editor.getTextCursorPosition().block
    const currentText = extractTextFromBlockContent(currentBlock.content)
    if (!currentText.trim()) return

    const prevBlocks = editor.document.slice(0, editor.document.indexOf(currentBlock) + 1)
    const context = prevBlocks.map((b) => extractTextFromBlockContent(b.content)).join("\n")

    const loadingBlock: PartialBlock = {
      type: "paragraph",
      content: [{ type: "text", text: "Soul Assistant đang tinh chỉnh đoạn văn...", styles: {} }],
    }
    editor.insertBlocks([loadingBlock], currentBlock, "after")
    const refinedBlock = editor.getTextCursorPosition().block

    try {
      const response = await fetch("/api/ai/autocomplete", {
        method: "POST",
        body: JSON.stringify({
          prompt: currentText,
          context,
          mode: "refine",
        }),
      })

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)

        // Update the block content using InlineContent[] format
        editor.updateBlock(refinedBlock, {
          type: "paragraph",
          content: [{ type: "text", text: fullText, styles: {} }],
        })
      }
    } catch (error) {
      console.error("AI Refine Error:", error)
      editor.updateBlock(refinedBlock, {
        content: [{ type: "text", text: "Lỗi khi tinh chỉnh đoạn văn với Soul Assistant.", styles: {} }],
      })
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto min-h-screen pt-12 pb-32">
      <BlockNoteView
        editor={editor}
        theme={theme === "dark" ? "dark" : "light"}
        onChange={() => {
          if (onChange) {
            onChange(editor.document)
          }
          if (documentId && onSyncStateChange) {
            onSyncStateChange("saving")
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = setTimeout(async () => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const currentBlocks = editor.document.map((b: any, idx: number) => ({
                  id: b.id,
                  type: b.type,
                  content: b.content,
                  parentBlockId: b.props?.parentBlockId || null,
                  sortOrder: idx,
                }))

                // Detect deleted blocks by comparing current IDs with previous IDs
                const currentIds = new Set(currentBlocks.map((b: { id: string }) => b.id))
                const deletions: string[] = []
                for (const prevId of prevBlockIdsRef.current) {
                  if (!currentIds.has(prevId)) {
                    deletions.push(prevId)
                  }
                }
                // Update the ref for next comparison
                prevBlockIdsRef.current = currentIds

                await fetch('/api/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    documentId,
                    upsert: currentBlocks,
                    deletions
                  })
                }).then(response => {
                  // FIX 3: Check response status before marking saved
                  if (!response.ok) {
                    console.error(`[SYNC_ERROR] Server returned ${response.status}: ${response.statusText}`)
                    onSyncStateChange("error")
                    return
                  }
                  onSyncStateChange("saved")
                  triggerIngest(documentId)
                })
              } catch {
                onSyncStateChange("error")
              }
            }, 1000)
          }
        }}
        className="font-serif editor-scribesoul"
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(slashMenuItems, query)
          }
          onItemClick={(item: DefaultReactSuggestionItem) => item.onItemClick()}
        />
      </BlockNoteView>
      <style jsx global>{`
        .editor-scribesoul .bn-container {
          background: transparent !important;
        }
        .editor-scribesoul .bn-editor {
          font-family: var(--font-newsreader), serif !important;
          font-size: 1.125rem !important;
          line-height: 1.7 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .editor-scribesoul .bn-editor-content {
          color: var(--on-surface) !important;
        }
        .editor-scribesoul .bn-block-content[data-content-type="heading"] .bn-inline-content {
           font-weight: 500 !important;
           letter-spacing: -0.02em !important;
        }
        /* No border focus */
        .editor-scribesoul *:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  )
}
