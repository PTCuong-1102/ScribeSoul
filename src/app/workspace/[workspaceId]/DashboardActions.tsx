"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createDocument } from "@/server/actions/documents"

export function DashboardActions({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNew = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const doc = await createDocument({
        workspaceId,
        title: 'Untitled',
        type: 'doc',
        status: 'draft'
      })
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSearch = () => {
    // Dispatch Cmd+K to open CommandSearch
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleCreateNew}
        disabled={isCreating}
        className="h-32 flex flex-col items-start justify-between p-6 rounded-2xl border-border/10 bg-surface-container-low hover:bg-surface-container-high dark:bg-surface-container dark:hover:bg-surface-container-highest transition-all group shadow-sm"
      >
        <Plus className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <span className="block font-serif text-lg text-on-surface">
            {isCreating ? "Đang tạo..." : "Chương mới"}
          </span>
          <span className="font-sans text-xs text-on-surface-variant tracking-wide uppercase">Bắt đầu bản thảo trống</span>
        </div>
      </Button>
      <Button
        variant="outline"
        onClick={handleSearch}
        className="h-32 flex flex-col items-start justify-between p-6 rounded-2xl border-border/10 border-dashed hover:border-solid hover:bg-surface-container-low transition-all group"
      >
        <Search className="w-6 h-6 text-on-surface-variant" />
        <div className="text-left">
          <span className="block font-serif text-lg text-on-surface">Tìm kiếm bối cảnh</span>
          <span className="font-sans text-xs text-on-surface-variant tracking-wide uppercase">Dùng AI truy xuất dữ liệu</span>
        </div>
      </Button>
    </>
  )
}
