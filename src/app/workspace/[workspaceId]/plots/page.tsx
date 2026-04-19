import React from 'react'
import { getDocumentsByType } from '@/server/actions/documents'
import { CreateDocumentButton } from '@/components/workspace/CreateDocumentButton'
import Link from 'next/link'
import { Target, FileText } from 'lucide-react'

export default async function PlotsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const docs = await getDocumentsByType(workspaceId, "plot")

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif text-on-surface flex items-center gap-3">
          <Target className="w-8 h-8 text-secondary" />
          Cốt truyện
        </h1>
        <CreateDocumentButton workspaceId={workspaceId} type="plot" label="Tạo cốt truyện" />
      </div>
      
      {docs.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] bg-surface-container-lowest border border-border/5 flex flex-col items-center space-y-4">
          <Target className="w-12 h-12 text-on-surface-variant/20" />
          <p className="text-on-surface-variant font-sans text-sm">Chưa có tuyến cốt truyện nào được tạo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map(doc => (
            <Link key={doc.id} href={`/workspace/${workspaceId}/documents/${doc.id}`} className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-all border border-border/5 group">
              <h3 className="text-xl font-serif text-on-surface group-hover:text-primary transition-colors">{doc.title}</h3>
              <div className="mt-4 flex items-center space-x-2 text-xs text-on-surface-variant font-sans">
                 <FileText className="w-3 h-3" />
                 <span>Cập nhật: {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
