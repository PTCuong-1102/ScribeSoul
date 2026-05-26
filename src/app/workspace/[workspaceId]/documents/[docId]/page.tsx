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
        interface BlockNode {
          id: string;
          type: string;
          content: unknown;
          children: BlockNode[];
        }
        const blockMap = new Map<string, BlockNode>()
        const roots: BlockNode[] = []

        // 1. Map each block to BlockNote PartialBlock format
        doc.blocks.forEach((b: Record<string, unknown>) => {
          blockMap.set(b.id as string, {
            id: b.id as string,
            type: b.type as string,
            content: b.content,
            children: [],
          })
        })

        // 2. Link children to their parent, preserve roots
        doc.blocks.forEach((b: Record<string, unknown>) => {
          const node = blockMap.get(b.id as string)
          if (node && b.parentBlockId && blockMap.has(b.parentBlockId as string)) {
            blockMap.get(b.parentBlockId as string)!.children.push(node)
          } else if (node) {
            roots.push(node)
          }
        })

        return roots as unknown as PartialBlock[]
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
