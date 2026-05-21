import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDocument } from '@/server/actions/documents'
import { toast } from 'sonner'

export interface CreateDocumentOptions {
  workspaceId: string
  title?: string
  type?: 'doc' | 'character' | 'setting' | 'plot'
  status?: 'draft' | 'revision' | 'finished' | 'idea'
  successMessage?: string
  errorMessage?: string
}

export function useCreateDocument() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateDocument = async (options: CreateDocumentOptions) => {
    if (isCreating) return null
    setIsCreating(true)
    try {
      const doc = await createDocument({
        workspaceId: options.workspaceId,
        title: options.title || 'Untitled',
        type: options.type || 'doc',
        status: options.status || 'draft',
      })
      
      router.push(`/workspace/${options.workspaceId}/documents/${doc.id}`)
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      return doc
    } catch (error) {
      console.error('Failed to create document:', error)
      const errMessage = options.errorMessage || 'Không thể tạo bản thảo mới. Vui lòng thử lại sau.'
      toast.error(errMessage)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return {
    isCreating,
    createDocument: handleCreateDocument,
  }
}
