"use client"

import React from 'react'
import { Plus } from 'lucide-react'
import { useCreateDocument } from '@/hooks/use-create-document'

export function CreateDocumentButton({ 
  workspaceId, 
  type, 
  label 
}: { 
  workspaceId: string
  type: "doc" | "character" | "setting" | "plot"
  label: string 
}) {
  const { isCreating, createDocument: handleCreateNewDoc } = useCreateDocument()

  const handleCreate = async () => {
    await handleCreateNewDoc({
      workspaceId,
      title: `New ${label}`,
      type,
      status: 'idea',
      successMessage: `Đã tạo ${label} mới!`
    })
  }

  return (
    <button 
      onClick={handleCreate}
      disabled={isCreating}
      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-sans"
    >
      <Plus className="w-4 h-4" />
      <span>{isCreating ? "Đang tạo..." : label}</span>
    </button>
  )
}
