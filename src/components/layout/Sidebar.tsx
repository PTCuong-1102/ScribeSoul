"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { getRecentDocuments, createDocument } from "@/server/actions/documents"
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Target, 
  Search, 
  Plus, 
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const workspaceId = typeof params?.workspaceId === "string" ? params.workspaceId : null

  const [recentDocs, setRecentDocs] = useState<{id: string, title: string}[]>([])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (workspaceId) {
      getRecentDocuments(workspaceId, 5)
        .then((docs) => setRecentDocs(docs))
        .catch(console.error)
    }
  }, [workspaceId])

  const handleCreateNew = async () => {
    if (!workspaceId || isCreating) return
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

  const navItems = [
    { name: 'Chương truyện', icon: BookOpen, href: workspaceId ? `/workspace/${workspaceId}/documents` : "/workspace" },
    { name: 'Nhân vật', icon: Users, href: workspaceId ? `/workspace/${workspaceId}/characters` : "/workspace" },
    { name: 'Bối cảnh', icon: MapPin, href: workspaceId ? `/workspace/${workspaceId}/settings-locations` : "/workspace" },
    { name: 'Cốt truyện', icon: Target, href: workspaceId ? `/workspace/${workspaceId}/plots` : "/workspace" },
  ]

  return (
    <aside className="w-[220px] h-screen bg-surface-container-low dark:bg-surface-container-low flex flex-col transition-colors duration-300">
      <div className="p-6">
        <Link href={workspaceId ? `/workspace/${workspaceId}` : "/workspace"} className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-serif text-xl">
            S
          </div>
          <span className="font-serif text-lg text-on-surface tracking-tight group-hover:text-secondary transition-colors">
            ScribeSoul
          </span>
        </Link>
      </div>

      <div className="px-4 py-2">
        <button 
          onClick={handleCreateNew}
          disabled={isCreating}
          className="w-full h-10 flex items-center justify-between px-3 rounded-xl bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all group border border-border/5"
        >
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
            <span className="font-sans text-sm font-medium text-on-surface">Viết mới</span>
          </div>
          <span className="font-sans text-[10px] text-on-surface-variant/40 bg-surface/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">N</span>
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center justify-between px-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Search className="w-4 h-4" />
              <span className="font-sans text-sm font-medium tracking-tight">Tìm kiếm</span>
            </div>
            <span className="font-sans text-[10px] text-on-surface-variant/40 tracking-tighter uppercase italic">Cmd+K</span>
          </button>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-sans text-sm transition-all duration-200 group",
                  isActive 
                    ? "bg-surface-container-high dark:bg-surface-container text-on-surface font-semibold" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )} />
                <span className="flex-1">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="pt-8 space-y-4">
          <div className="px-3 flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 font-bold">
              Gần đây
            </span>
          </div>
          <div className="space-y-0.5 px-1">
            {recentDocs.length === 0 ? (
               <p className="px-2 text-xs text-on-surface-variant font-sans italic opacity-50">Trống</p>
            ) : recentDocs.map(doc => (
              <Link key={doc.id} href={workspaceId ? `/workspace/${workspaceId}/documents/${doc.id}` : "/workspace"} className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-surface-container-high/40 transition-all group">
                <ChevronRight className="w-3 h-3 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-sans text-sm text-on-surface-variant group-hover:text-on-surface truncate">{doc.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-1 border-t border-border/5">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/5 transition-all group">
          <Sparkles className="w-4 h-4 transition-colors group-hover:animate-pulse" />
          <span className="font-sans text-sm font-medium">Soul Assistant</span>
        </button>
        <Link href={workspaceId ? `/workspace/${workspaceId}/settings` : "/workspace"} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all">
          <Settings className="w-4 h-4" />
          <span className="font-sans text-sm font-medium">Cài đặt</span>
        </Link>
      </div>
    </aside>
  )
}
