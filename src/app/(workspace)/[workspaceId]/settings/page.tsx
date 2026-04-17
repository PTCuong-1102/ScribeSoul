"use client"

import React, { useState, useEffect } from "react"
import { User, Shield, Sparkles, Bell, Save, Trash2, Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { getUserSettings, updateProfile } from "@/server/actions/settings"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [name, setName] = useState("")

  useEffect(() => {
    async function load() {
      const data = await getUserSettings()
      if (data) {
        setUser(data as unknown as Record<string, unknown>)
        setName(data.name || "")
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ name })
      // Success feedback
    } catch (e) {
      console.error(e)
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
        <nav className="space-y-2">
          {[
            { id: 'profile', label: 'Hồ sơ', icon: User },
            { id: 'appearance', label: 'Giao diện', icon: Moon },
            { id: 'ai', label: 'Trợ lý AI', icon: Sparkles },
            { id: 'notifications', label: 'Thông báo', icon: Bell },
            { id: 'security', label: 'Bảo mật', icon: Shield },
          ].map((item) => (
            <button 
              key={item.id}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-sans text-on-surface-variant hover:bg-surface-container-low transition-all group"
            >
              <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
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
          {/* Profile Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Tên hiển thị</label>
                <Input 
                  value={name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="bg-surface-container-lowest border-border/10 rounded-xl font-serif text-lg py-6 focus:ring-secondary/20" 
                />
              </div>
              <div className="space-y-2 opacity-60">
                <label className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Email (Liên kết)</label>
                <Input 
                  value={(user?.email as string) || ""} 
                  disabled
                  className="bg-surface-container-low border-border/10 rounded-xl font-serif text-lg py-6"
                />
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="space-y-6">
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

          {/* AI Capabilities */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif text-on-surface border-b border-border/5 pb-2">Mô hình AI</h3>
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
          </section>

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
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
