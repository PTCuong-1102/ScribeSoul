import React from 'react'
import { Plus, Clock, FileText, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KnowledgeWeb } from '@/components/dashboard/KnowledgeWeb'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { ProductivityPulse } from '@/components/dashboard/ProductivityPulse'
import { getDocumentTree, getProductivityStats } from "@/server/actions/documents"

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const documents = await getDocumentTree(workspaceId).catch(() => []);
  const productivityStats = await getProductivityStats(workspaceId).catch(() => ({
    wordsToday: 0,
    streak: 0,
    wordsDelta: 0,
    percentOfGoal: 0,
    dailyGoal: 2000,
  }));
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
          <Button variant="outline" className="h-32 flex flex-col items-start justify-between p-6 rounded-2xl border-border/10 bg-surface-container-low hover:bg-surface-container-high dark:bg-surface-container dark:hover:bg-surface-container-highest transition-all group shadow-sm">
            <Plus className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block font-serif text-lg text-on-surface">Chương mới</span>
              <span className="font-sans text-xs text-on-surface-variant tracking-wide uppercase">Bắt đầu bản thảo trống</span>
            </div>
          </Button>
          <Button variant="outline" className="h-32 flex flex-col items-start justify-between p-6 rounded-2xl border-border/10 border-dashed hover:border-solid hover:bg-surface-container-low transition-all group">
            <Search className="w-6 h-6 text-on-surface-variant" />
            <div className="text-left">
              <span className="block font-serif text-lg text-on-surface">Tìm kiếm bối cảnh</span>
              <span className="font-sans text-xs text-on-surface-variant tracking-wide uppercase">Dùng AI truy xuất dữ liệu</span>
            </div>
          </Button>
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
          <Button variant="ghost" className="font-sans text-sm text-secondary hover:underline">Xem tất cả</Button>
        </div>

        {recentDrafts.length === 0 ? (
          <div className="p-8 text-center rounded-[2rem] bg-surface-container-lowest border border-border/5">
            <p className="text-on-surface-variant font-sans text-sm">Chưa có bản thảo nào. Hãy tạo chương mới!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="group p-8 rounded-[2rem] bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest shadow-[0_10px_30px_rgba(27,28,25,0.06)] dark:shadow-none transition-all duration-500 cursor-pointer border border-border/5">
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
