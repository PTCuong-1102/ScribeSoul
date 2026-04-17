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
  initialContent?: PartialBlock[]
  onChange?: (blocks: PartialBlock[]) => void
}

export default function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const { theme } = useTheme()

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
      onItemClick: () => {
        // Simple placeholder for refine logic
        alert("Refine feature coming soon!");
      },
    },
  ] as DefaultReactSuggestionItem[];

  // AI Autocomplete function
  const soulWrite = async (editor: BlockNoteEditor) => {
    const currentBlock = editor.getTextCursorPosition().block;
    const prevBlocks = editor.document.slice(0, editor.document.indexOf(currentBlock) + 1);
    const context = prevBlocks.map(b => (b.content as any)?.[0]?.text || "").join("\n");
    
    // Insert a temporary "AI is writing..." block or similar
    const loadingBlock: PartialBlock = {
      type: "paragraph",
      content: "Soul Assistant đang suy nghĩ...",
    };
    editor.insertBlocks([loadingBlock], currentBlock, "after");
    const newBlock = editor.getTextCursorPosition().block;

    try {
      const response = await fetch("/api/ai/autocomplete", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: (currentBlock.content as any)?.[0]?.text || "",
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
        
        // Update the block content
        editor.updateBlock(newBlock, {
          type: "paragraph",
          content: fullText,
        });
      }
    } catch (error) {
       console.error("AI Error:", error);
       editor.updateBlock(newBlock, {
         content: "Lỗi khi kết nối với Soul Assistant.",
       });
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
