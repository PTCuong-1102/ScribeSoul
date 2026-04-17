"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, FileText, Sparkles, Command, ChevronRight } from "lucide-react"
import { semanticSearch } from "@/server/actions/search"
import { useRouter } from "next/navigation"

export function CommandSearch({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  interface SearchResult {
    id: string;
    docId: string;
    title: string;
    excerpt: string;
  }
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Toggle Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Use a ref for the timeout to handle debouncing
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null)

  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    if (val.length < 2) {
      setResults([])
      return
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    setLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchResults = await semanticSearch(workspaceId, val)
        setResults(searchResults)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms debounce
  }, [workspaceId])

  const handleSelect = (docId: string) => {
    setOpen(false)
    router.push(`/${workspaceId}/documents/${docId}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-surface/80 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-border/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col glass slide-in-from-top-4 duration-300">
        <div className="p-4 border-b border-border/5 flex items-center space-x-3">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-on-surface font-sans text-lg placeholder:text-on-surface-variant/30"
            placeholder="Tìm kiếm bối cảnh, nhân vật, cốt truyện..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="flex items-center space-x-1 bg-surface-container rounded px-2 py-1">
            <span className="text-[10px] text-on-surface-variant/60 font-medium">ESC</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[60vh] p-2">
          {loading && (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
              <p className="text-xs text-on-surface-variant font-sans uppercase tracking-widest">Đang tìm kiếm trong Soul Universe...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((r) => (
                <button 
                  key={r.id}
                  onClick={() => handleSelect(r.docId)}
                  className="w-full text-left p-4 rounded-xl hover:bg-surface-container-high transition-all group flex items-start space-x-4 border border-transparent hover:border-border/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base text-on-surface group-hover:text-primary transition-colors">{r.title}</h4>
                    <p className="font-sans text-xs text-on-surface-variant line-clamp-1">{r.excerpt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant/20 self-center" />
                </button>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="p-8 text-center text-on-surface-variant text-sm font-sans italic">
              Không tìm thấy kết quả phù hợp.
            </p>
          )}
          
          {!query && (
            <div className="p-8 text-center space-y-4">
              <Command className="w-12 h-12 text-on-surface-variant/10 mx-auto" />
              <p className="text-xs text-on-surface-variant/40 font-sans uppercase tracking-[0.2em]">
                Nhập từ khóa để bắt đầu tìm kiếm
              </p>
            </div>
          )}
        </div>

        <div className="p-3 bg-surface-container-lowest/50 border-t border-border/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <kbd className="bg-surface-container p-1 rounded text-[10px] text-on-surface-variant font-sans px-1.5 shadow-sm">↵</kbd>
              <span className="text-[10px] text-on-surface-variant/40 font-sans uppercase">Chọn</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="bg-surface-container p-1 rounded text-[10px] text-on-surface-variant font-sans px-1.5 shadow-sm">↑↓</kbd>
              <span className="text-[10px] text-on-surface-variant/40 font-sans uppercase">Di chuyển</span>
            </div>
          </div>
          <p className="text-[10px] text-on-surface-variant/30 font-serif italic">
            Semantic Search powered by Soul Assistant
          </p>
        </div>
      </div>
    </div>
  )
}
