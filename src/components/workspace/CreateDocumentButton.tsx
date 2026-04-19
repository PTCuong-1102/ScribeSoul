"use client"

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createDocument } from '@/server/actions/documents'

export function CreateDocumentButton({ 
  workspaceId, 
  type, 
  label 
}: { 
  workspaceId: string
  type: "doc" | "character" | "setting" | "plot"
  label: string 
}) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const doc = await createDocument({
        workspaceId,
        title: `New ${label}`,
        type,
        status: 'idea'
      })
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
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
