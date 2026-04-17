import React from 'react'
import { Plus, Clock, FileText, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-12 space-y-16">
      {/* Header section */}
      <section className="space-y-4">
        <h1 className="text-5xl font-serif text-on-surface tracking-tight">Thư viện của bạn</h1>
        <p className="font-sans text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Chào mừng trở lại, Elias. Hôm nay bạn muốn khám phá điều gì trong thế giới của mình?
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

        <div className="bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 space-y-6 flex flex-col justify-center border border-border/5">
          <div className="space-y-1">
            <span className="text-4xl font-serif text-primary">48.2k</span>
            <span className="block font-sans text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Tổng số từ viết</span>
          </div>
          <div className="h-1 bg-border/10 rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-3/4 shadow-[0_0_10px_var(--ai-glow)]" />
          </div>
          <p className="font-sans text-xs text-on-surface-variant italic leading-relaxed">
            "Bạn đang ở giữa cao trào của Chương 3. Trợ lý AI đã tìm thấy 3 mâu thuẫn cần giải quyết."
          </p>
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Chương 3: The Iron Spire', excerpt: 'Chiếc đồng hồ trong thư viện không kêu tích tắc; nó đang thở...', status: 'Đang viết', date: '2 giờ trước' },
            { title: 'Elias Thorne', excerpt: 'Một cựu lưu trữ viên bị ám ảnh bởi sự im lặng của Thư viện Lớn...', status: 'Bản nháp', date: 'Hôm qua' },
            { title: 'Cố sự tại Opal Spires', excerpt: 'Những ngọn tháp mọc lên từ cát bụi như những ngón tay gầy guộc...', status: 'Sửa đổi', date: '13 Th04' },
          ].map((draft, i) => (
            <div key={i} className="group p-8 rounded-[2rem] bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest shadow-[0_10px_30px_rgba(27,28,25,0.06)] dark:shadow-none transition-all duration-500 cursor-pointer border border-border/5">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="secondary" className="bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                  {draft.status}
                </Badge>
                <span className="font-sans text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{draft.date}</span>
              </div>
              <h3 className="text-xl font-serif text-on-surface mb-3 group-hover:text-primary transition-colors">{draft.title}</h3>
              <p className="font-serif italic text-on-surface-variant text-sm leading-relaxed line-clamp-2">
                "{draft.excerpt}"
              </p>
              <div className="mt-8 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge Web Placeholder */}
      <section className="pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="w-5 h-5 text-on-surface-variant rotate-45" />
            <h2 className="text-2xl font-serif text-on-surface">Mạng lưới kiến thức</h2>
          </div>
        </div>
        
        <div className="h-80 w-full rounded-[2.5rem] bg-surface-container-low dark:bg-surface-container-lowest/50 relative overflow-hidden flex items-center justify-center border border-border/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--ai-glow)_0%,transparent_70%)] opacity-50" />
          <div className="relative text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto violet-glow animate-pulse">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <p className="font-sans text-sm text-on-surface-variant italic">
              AI đang phân tích các mối liên kết giữa các nhân vật và bối cảnh...
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  )
}
