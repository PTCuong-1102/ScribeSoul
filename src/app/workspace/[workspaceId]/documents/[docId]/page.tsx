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

  // Restore tree structure if needed, or pass flat string. 
  // For simplicity, we just pass the blocks if they exist.
  const initialContent = doc.blocks.length > 0 
    ? doc.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        content: b.content,
      } as unknown as PartialBlock))
    : undefined

  return (
    <DocumentClientView 
      workspaceId={workspaceId} 
      docId={docId} 
      initialContent={initialContent} 
    />
  )
}
