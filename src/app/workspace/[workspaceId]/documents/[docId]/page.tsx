import React from 'react'
import { redirect } from 'next/navigation'
import { getDocument } from '@/server/actions/documents'
import { DocumentClientView } from '@/components/editor/DocumentClientView'
import { PartialBlock } from "@blocknote/core"
import { auth } from '@/lib/auth/server'

export default async function DocumentPage({ params }: { params: Promise<{ workspaceId: string, docId: string }> }) {
  // Verify session before rendering
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { workspaceId, docId } = await params;

  let doc
  try {
    doc = await getDocument(docId)
  } catch (error) {
    // Distinguish auth errors from not found
    if (error instanceof Error) {
      if (error.message.includes('Chưa đăng nhập')) {
        redirect('/login')
      }
      if (error.message.includes('Không có quyền')) {
        return <div className="p-12 text-center font-sans text-destructive">Bạn không có quyền truy cập document này.</div>
      }
    }
    return <div className="p-12 text-center font-sans">Không tìm thấy tài liệu hoặc bạn không có quyền truy cập.</div>
  }

  // Reconstruct tree structure from flat list of blocks ordered by sortOrder
  const initialContent = doc.blocks.length > 0 
    ? (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockMap = new Map<string, any>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roots: any[] = []

        // 1. Map each block to BlockNote PartialBlock format
        doc.blocks.forEach((b) => {
          blockMap.set(b.id, {
            id: b.id,
            type: b.type,
            content: b.content,
            children: [],
          })
        })

        // 2. Link children to their parent, preserve roots
        doc.blocks.forEach((b) => {
          const node = blockMap.get(b.id)
          if (b.parentBlockId && blockMap.has(b.parentBlockId)) {
            blockMap.get(b.parentBlockId).children.push(node)
          } else {
            roots.push(node)
          }
        })

        return roots as PartialBlock[]
      })()
    : undefined

  return (
    <DocumentClientView 
      workspaceId={workspaceId} 
      docId={docId} 
      initialContent={initialContent} 
    />
  )
}
