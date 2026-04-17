"use client"

import React, { useMemo } from 'react'
import { BlockNoteEditor, PartialBlock } from "@blocknote/core"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"
import { useTheme } from "next-themes"

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
  })

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
      />
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
