import React from 'react'
import { getDocumentTree } from "@/server/actions/documents"
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default async function DocumentsPage({ params }: { params: { workspaceId: string } }) {
  const documents = await getDocumentTree(params.workspaceId).catch(() => []);

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-8">
      <h1 className="text-4xl font-serif text-on-surface">Tất cả chương truyện</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <p className="text-on-surface-variant font-sans">Chưa có bản thảo nào.</p>
        ) : (
          documents.map(doc => (
            <Link href={`/${params.workspaceId}/documents/${doc.id}`} key={doc.id}>
              <div className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors border border-border/5 group cursor-pointer">
                <FileText className="w-8 h-8 text-on-surface-variant mb-4 group-hover:text-primary transition-colors" />
                <h3 className="font-serif text-lg text-on-surface truncate">{doc.title}</h3>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
