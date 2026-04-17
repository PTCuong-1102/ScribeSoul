"use client"

import React, { useState } from "react"
import { Sparkles, ArrowRight, BookOpen, PenTool, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(true)

  if (!open) return null

  const steps = [
    {
      id: 1,
      title: "Chào mừng đến với ScribeSoul",
      desc: "Nơi ngôn từ của bạn được nuôi dưỡng bởi trí tuệ nhân tạo. Hãy bắt đầu hành trình sáng tạo mới.",
      icon: Sparkles
    },
    {
      id: 2,
      title: "Viết lách tập trung",
      desc: "Giao diện tối giản giúp bạn đắm chìm trong từng câu chữ. Dùng phím tắt '/' để kích hoạt Soul Assistant.",
      icon: PenTool
    },
    {
      id: 3,
      title: "Mạng lưới kiến thức",
      desc: "AI sẽ tự động liên kết các tình tiết, nhân vật và bối cảnh để tạo nên một vũ trụ nhất quán.",
      icon: Library
    }
  ]

  const next = () => {
    if (step < steps.length) setStep(step + 1)
    else setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface/60 backdrop-blur-xl" />
      
      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-[3rem] shadow-2xl overflow-hidden border border-border/10 p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto violet-glow">
          {React.createElement(steps[step-1].icon, { className: "w-10 h-10 text-secondary" })}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-on-surface">
            {steps[step-1].title}
          </h2>
          <p className="font-sans text-on-surface-variant leading-relaxed">
            {steps[step-1].desc}
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "h-1 transition-all duration-300 rounded-full",
                step === s.id ? "w-8 bg-secondary" : "w-2 bg-on-surface-variant/20"
              )} 
            />
          ))}
        </div>

        <div className="pt-4">
          <Button 
            onClick={next}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-8 font-sans text-sm uppercase tracking-[0.2em] transition-all group active:scale-95"
          >
            {step === steps.length ? "Bắt đầu ngay" : "Tiếp theo"}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <button 
            onClick={() => setOpen(false)}
            className="mt-6 text-xs text-on-surface-variant/40 hover:text-on-surface-variant/60 font-sans uppercase tracking-widest transition-colors"
          >
            Bỏ qua hướng dẫn
          </button>
        </div>
      </div>
    </div>
  )
}
