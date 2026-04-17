import React from 'react'
import BlockEditor from '@/components/editor/BlockEditor'
import { Button } from '@/components/ui/button'
import { Sparkles, Save, History } from 'lucide-react'

export default function DocumentPage({ params }: { params: { workspaceId: string, docId: string } }) {
  return (
    <div className="flex w-full h-full relative">
      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-0">
        <BlockEditor />
      </div>

      {/* Floating Toolbar (Optional or pinned to bottom) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass border border-border/10 rounded-2xl p-2 flex items-center space-x-2 shadow-2xl z-50 transition-all hover:scale-[1.02]">
        <Button variant="ghost" size="sm" className="font-sans text-xs flex items-center space-x-2 text-on-surface-variant hover:text-on-surface rounded-xl px-3 h-10">
          <History className="w-4 h-4" />
          <span>Lịch sử</span>
        </Button>
        <div className="w-px h-6 bg-border/10" />
        <Button variant="ghost" size="sm" className="font-sans text-xs flex items-center space-x-2 text-on-surface-variant hover:text-on-surface rounded-xl px-3 h-10">
          <Save className="w-4 h-4" />
          <span>Lưu</span>
        </Button>
        <Button className="font-sans text-xs flex items-center space-x-2 bg-secondary text-secondary-foreground hover:opacity-90 rounded-xl px-4 h-10 shadow-lg shadow-secondary/20 violet-glow">
          <Sparkles className="w-4 h-4" />
          <span>Soul Assistant</span>
        </Button>
      </div>

      {/* Right Sidebar Placeholder (AI Context) */}
      <div className="hidden xl:block w-80 h-full bg-surface-container-low/30 border-l border-border/5 p-8 space-y-8 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="font-serif text-lg text-on-surface">Bối cảnh liên quan</h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed text-balance">
            AI đang theo dõi nội dung chương này để cung cấp các gợi ý về bối cảnh đã thiết lập.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-border/10 space-y-2 group cursor-pointer hover:bg-surface-container-high transition-all">
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">Gợi ý bối cảnh</span>
            <p className="font-serif text-sm text-on-surface italic">
              "Hãy nhớ rằng Tháp Opal sẽ phát ra ánh sáng tím khi mặt trăng lặn..."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
