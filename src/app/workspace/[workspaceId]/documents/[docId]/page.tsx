import React from 'react'
import { getDocument } from '@/server/actions/documents'
import { DocumentClientView } from '@/components/editor/DocumentClientView'
import { PartialBlock } from "@blocknote/core"

export default async function DocumentPage({ params }: { params: { workspaceId: string, docId: string } }) {
  let doc
  try {
    doc = await getDocument(params.docId)
  } catch {
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
      workspaceId={params.workspaceId} 
      docId={params.docId} 
      initialContent={initialContent} 
    />
  )
}
