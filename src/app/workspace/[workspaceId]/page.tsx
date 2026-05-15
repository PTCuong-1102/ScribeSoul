import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock, FileText } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { KnowledgeWeb } from '@/components/dashboard/KnowledgeWeb'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { ProductivityPulse } from '@/components/dashboard/ProductivityPulse'
import { DashboardActions } from './DashboardActions'
import { getDocumentTree, getProductivityStats } from "@/server/actions/documents"
import { auth } from '@/lib/auth/server'

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  // Verify session before rendering
  const { data: session } = await auth.getSession()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { workspaceId } = await params;
  
  // FIX 4: Handle errors explicitly instead of silent failure
  let documents: Awaited<ReturnType<typeof getDocumentTree>> = []
  try {
    documents = await getDocumentTree(workspaceId)
  } catch (error) {
    console.error("Failed to load document tree:", error)
    // Still render page but with empty state, errors logged for monitoring
  }

  let productivityStats = {
    wordsToday: 0,
    streak: 0,
    wordsDelta: 0,
    percentOfGoal: 0,
    dailyGoal: 2000,
  }
  try {
    productivityStats = await getProductivityStats(workspaceId)
  } catch (error) {
    console.error("Failed to load productivity stats:", error)
    // Use fallback defaults, errors logged for monitoring
  }

  const recentDrafts = documents.slice(0, 3); // Get latest 3 drafts

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-16">
      <OnboardingWizard />
      {/* Header section */}
      <section className="space-y-4">
        <h1 className="text-5xl font-serif text-on-surface tracking-tight">Thư viện của bạn</h1>
        <p className="font-sans text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Chào mừng trở lại, người lưu trữ. Hôm nay bạn muốn khám phá điều gì trong thế giới của mình?
        </p>
      </section>

      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DashboardActions workspaceId={workspaceId} />
        </div>
        <ProductivityPulse stats={productivityStats} />
      </div>

      {/* Recent Drafts */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-on-surface-variant" />
            <h2 className="text-2xl font-serif text-on-surface">Bản thảo gần đây</h2>
          </div>
          <Link href={`/workspace/${workspaceId}/documents`} className="font-sans text-sm text-secondary hover:underline">
            Xem tất cả
          </Link>
        </div>

        {recentDrafts.length === 0 ? (
          <div className="p-8 text-center rounded-[2rem] bg-surface-container-lowest border border-border/5">
            <p className="text-on-surface-variant font-sans text-sm">Chưa có bản thảo nào. Hãy tạo chương mới!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDrafts.map((draft) => (
              <Link key={draft.id} href={`/workspace/${workspaceId}/documents/${draft.id}`}>
                <div className="group p-8 rounded-[2rem] bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest shadow-[0_10px_30px_rgba(27,28,25,0.06)] dark:shadow-none transition-all duration-500 cursor-pointer border border-border/5">
                  <div className="flex items-center justify-between mb-6">
                    <Badge variant="secondary" className="bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                      {draft.status}
                    </Badge>
                    <span className="font-sans text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                      {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : 'Mới'}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-on-surface mb-3 group-hover:text-primary transition-colors">{draft.title}</h3>
                  <p className="font-serif italic text-on-surface-variant text-sm leading-relaxed line-clamp-2">
                    &quot;Bản thảo đang được chỉnh sửa...&quot;
                  </p>
                  <div className="mt-8 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Knowledge Web */}
      <section className="pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-serif text-on-surface">Mạng lưới kiến thức</h2>
          </div>
        </div>
        
        <KnowledgeWeb workspaceId={workspaceId} />
      </section>
    </div>
  )
}
