"use client"
import React, { useState } from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { CommandSearch } from '@/components/search/CommandSearch'
import { Button } from '@/components/ui/button'
import { Sparkles, Save, History, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { PartialBlock } from "@blocknote/core"

export function DocumentClientView({ 
  workspaceId, 
  docId, 
  initialContent 
}: { 
  workspaceId: string, 
  docId: string, 
  initialContent: PartialBlock[] | undefined 
}) {
  const [showAssistant, setShowAssistant] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  return (
    <div className="flex w-full h-full relative overflow-hidden bg-surface">
      <CommandSearch workspaceId={workspaceId} />
      {/* Main Editor Area */}
      <div className={cn(
        "flex-1 overflow-y-auto px-4 lg:px-0 transition-all duration-500",
        showAssistant ? "mr-0" : ""
      )}>
        <BlockEditor 
          documentId={docId}
          initialContent={initialContent} 
          onSyncStateChange={(state) => setSyncStatus(state)} 
        />
      </div>

      {/* Floating Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass border border-border/10 rounded-2xl p-2 flex items-center space-x-2 shadow-2xl z-50 transition-all hover:scale-[1.02]">
        <Button variant="ghost" size="sm" className="font-sans text-xs flex items-center space-x-2 text-on-surface-variant hover:text-on-surface rounded-xl px-3 h-10">
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Lịch sử</span>
        </Button>
        <div className="w-px h-6 bg-border/10" />
        <Button variant="ghost" size="sm" className="font-sans text-xs flex items-center space-x-2 text-on-surface-variant hover:text-on-surface rounded-xl px-3 h-10">
          {syncStatus === "saving" ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : syncStatus === "saved" ? (
            <Save className="w-4 h-4 text-green-500" />
          ) : (
             <Save className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {syncStatus === "saving" ? "Đang lưu..." : syncStatus === "saved" ? "Đã lưu" : "Lưu"}
          </span>
        </Button>
        <Button 
          onClick={() => setShowAssistant(!showAssistant)}
          className={cn(
            "font-sans text-xs flex items-center space-x-2 rounded-xl px-4 h-10 shadow-lg transition-all",
            showAssistant 
              ? "bg-secondary text-secondary-foreground shadow-secondary/20 violet-glow" 
              : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Soul Assistant</span>
        </Button>
      </div>

      {/* Right Sidebar Assistant */}
      <aside className={cn(
        "fixed right-0 top-0 h-full bg-surface-container-low/30 border-l border-border/5 transition-all duration-500 z-40 overflow-hidden",
        showAssistant ? "w-96 translate-x-0" : "w-0 translate-x-full"
      )}>
        <div className="w-96 h-full">
          <ChatInterface workspaceId={workspaceId} />
        </div>
      </aside>
    </div>
  )
}
