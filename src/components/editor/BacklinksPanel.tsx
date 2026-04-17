"use client"

import React, { useEffect, useState } from 'react'
import { getBacklinks } from '@/server/actions/links'
import { FileText, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export function BacklinksPanel({ documentId }: { documentId: string }) {
  const [backlinks, setBacklinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getBacklinks(documentId)
        setBacklinks(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [documentId])

  if (loading) return null
  if (backlinks.length === 0) return null

  return (
    <div className="mt-20 pt-8 border-t border-border/10 space-y-6 max-w-[800px] mx-auto px-4 lg:px-0">
      <div className="flex items-center space-x-2 text-on-surface-variant">
        <LinkIcon className="w-4 h-4" />
        <h3 className="font-sans text-xs uppercase tracking-widest font-bold">Liên kết ngược ({backlinks.length})</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {backlinks.map((link) => (
          <Link 
            key={link.id} 
            href={`/workspace/${link.source.workspaceId}/documents/${link.source.id}`}
            className="group p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-start space-x-4 border border-border/5"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="block font-serif text-sm text-on-surface group-hover:underline decoration-primary/30 underline-offset-4">
                {link.source.title}
              </span>
              <span className="block font-sans text-[10px] text-on-surface-variant/40 uppercase tracking-tighter">
                {link.type === 'mention' ? 'Được đề cập trong nội dung' : 'Tham chiếu trực tiếp'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
