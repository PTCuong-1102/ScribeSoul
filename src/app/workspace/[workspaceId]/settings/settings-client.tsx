"use client"

import React, { useState, useEffect } from "react"
import { User, Shield, Sparkles, Bell, Save, Trash2, Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { getUserSettings, updateProfile, updateAIPreferences } from "@/server/actions/settings"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SettingsPageClient() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState("")
  const [aiModel, setAiModel] = useState("soul-intelligence-v1")
  const [creativity, setCreativity] = useState("medium")

  useEffect(() => {
    async function load() {
      const data = await getUserSettings()
      if (data) {
        setUser(data as unknown as Record<string, unknown>)
        setName(data.name || "")
        if (data.aiPreferences) {
          const prefs = data.aiPreferences as Record<string, unknown>
          if (typeof prefs.model === "string") setAiModel(prefs.model)
          if (typeof prefs.creativity === "string") setCreativity(prefs.creativity)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === "profile") {
        await updateProfile({ name })
        toast.success("Đã cập nhật thông tin cá nhân!")
      } else if (activeTab === "ai") {
        await updateAIPreferences({ model: aiModel, creativity })
        toast.success("Đã cập nhật thiết lập AI!")
      } else {
        toast.success("Đã lưu thiết lập thành công!")
      }
    } catch (e) {
      console.error(e)
      toast.error("Có lỗi xảy ra khi lưu thiết lập.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 animate-pulse">Đang tải thiết lập...</div>

  return (
    <div className="max-w-4xl mx-auto p-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif text-on-surface">Thiết lập tài khoản</h1>
        <p className="font-sans text-on-surface-variant italic">Cá nhân hóa không gian lưu trữ và trợ lý AI của bạn.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Navigation */}
        <nav role="tablist" className="space-y-2">
          {[
            { id: 'profile', label: 'Hồ sơ', icon: User },
            { id: 'appearance', label: 'Giao diện', icon: Moon },
            { id: 'ai', label: 'Trợ lý AI', icon: Sparkles },
            { id: 'notifications', label: 'Thông báo', icon: Bell },
            { id: 'security', label: 'Bảo mật', icon: Shield },
          ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={`Tab ${item.label}`}
                role="tab"
                aria-selected={activeTab === item.id}
                className={cn(
                "w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-sans transition-all group",
                activeTab === item.id 
                  ? "bg-surface-container-high text-primary font-medium" 
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                activeTab === item.id ? "text-primary" : "group-hover:text-primary"
              )} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-border/5">
            <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-sans text-destructive hover:bg-destructive/5 transition-all">
              <Trash2 className="w-4 h-4" />
              <span>Xóa tài khoản</span>
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="md:col-span-3 space-y-12">
          {activeTab === 'profile' && (
            <section role="tabpanel" className="space-y-6">
              <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label htmlFor="display-name" className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Tên hiển thị</label>
                  <Input
                    id="display-name"
                    value={name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="bg-surface-container-lowest border-border/10 rounded-xl font-serif text-lg py-6 focus:ring-secondary/20" 
                  />
                </div>
                <div className="space-y-2 opacity-60">
                  <label htmlFor="email-display" className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Email (Liên kết)</label>
                  <Input
                    id="email-display"
                    value={(user?.email as string) || ""} 
                    disabled
                    className="bg-surface-container-low border-border/10 rounded-xl font-serif text-lg py-6"
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section role="tabpanel" className="space-y-6">
              <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Chủ đề & Giao diện</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Ngày', icon: Sun },
                  { id: 'dark', label: 'Đêm', icon: Moon },
                  { id: 'system', label: 'Hệ thống', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    aria-label={`Chủ đề ${t.label}`}
                    aria-pressed={theme === t.id}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all space-y-3 group",
                      theme === t.id 
                        ? "bg-surface-container-high border-secondary shadow-sm" 
                        : "bg-surface-container-low border-border/10 hover:border-border/30"
                    )}
                  >
                    <t.icon className={cn(
                     "w-6 h-6 group-hover:scale-110 transition-transform",
                     theme === t.id ? "text-secondary" : "text-on-surface-variant"
                    )} />
                    <span className="text-xs font-sans font-medium uppercase tracking-tighter">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'ai' && (
            <section role="tabpanel" className="space-y-6">
              <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Thiết lập Trợ lý AI</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-surface-container-low border border-border/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-on-surface">Soul Intelligence (v1.0)</span>
                      <Badge className="bg-secondary/10 text-secondary border-none text-[10px]">Active</Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant font-sans italic">Mô hình tối ưu cho viết lách sáng tạo và phân tích cốt truyện.</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-secondary/20" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                      <label htmlFor="ai-model-select" className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Mô hình AI ưu tiên</label>
                    <select
                      id="ai-model-select"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-border/10 rounded-xl p-4 font-sans text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                      <option value="soul-intelligence-v1">Soul Intelligence v1.0 (Khuyên dùng)</option>
                      <option value="gpt-4o">GPT-4o (Đa năng)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Văn phong mượt mà)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="creativity-select" className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Độ sáng tạo (Creativity)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'low', label: 'Nhất quán (Low)' },
                        { id: 'medium', label: 'Cân bằng (Medium)' },
                        { id: 'high', label: 'Tự do (High)' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setCreativity(opt.id)}
                          className={cn(
                            "py-3 px-4 rounded-xl border text-xs font-sans text-center transition-all",
                            creativity === opt.id
                              ? "bg-secondary/10 border-secondary text-secondary font-medium"
                              : "bg-surface-container-lowest border-border/10 text-on-surface-variant hover:bg-surface-container-low"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section role="tabpanel" className="space-y-6">
              <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Thông báo</h3>
              <p className="text-sm font-sans text-on-surface-variant italic">Tính năng quản lý thông báo đang được phát triển.</p>
            </section>
          )}

          {activeTab === 'security' && (
            <section role="tabpanel" className="space-y-6">
              <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Bảo mật</h3>
              <p className="text-sm font-sans text-on-surface-variant italic">Tính năng quản lý bảo mật đang được phát triển.</p>
            </section>
          )}

          {/* Render Save Button only for editable tabs */}
          {['profile', 'ai', 'appearance'].includes(activeTab) && (
            <div className="pt-8 flex justify-end">
               <Button 
                 onClick={handleSave} 
                 disabled={saving}
                 className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-6 font-sans text-sm uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
               >
                 {saving ? "Đang lưu..." : "Lưu thay đổi"}
                 <Save className="w-4 h-4 ml-2" />
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
