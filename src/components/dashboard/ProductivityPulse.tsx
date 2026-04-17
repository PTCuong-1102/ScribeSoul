"use client"

import React from "react"
import { TrendingUp, Award, Zap } from "lucide-react"

export function ProductivityPulse() {
  // In a real app, these would come from the database/analytics service
  const stats = {
    wordsToday: 1240,
    streak: 12,
    percentOfGoal: 62
  }

  return (
    <div className="bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 space-y-6 flex flex-col justify-center border border-border/5 group hover:shadow-xl transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-4xl font-serif text-primary group-hover:text-secondary transition-colors">
            {stats.wordsToday.toLocaleString()}
          </span>
          <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Từ viết hôm nay</span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary violet-glow animate-float">
          <Zap className="w-6 h-6 fill-current" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
          <span>Tiến độ mục tiêu</span>
          <span>{stats.percentOfGoal}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/5">
          <div 
            className="h-full bg-secondary shadow-[0_0_15px_var(--ai-glow)] transition-all duration-1000 ease-out" 
            style={{ width: `${stats.percentOfGoal}%` }} 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface text-secondary border border-secondary/10">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">+{Math.round(stats.wordsToday * 0.1)} so với hôm qua</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary">
          <Award className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{stats.streak} ngày liên tục</span>
        </div>
      </div>

      <p className="font-sans text-xs text-on-surface-variant italic leading-relaxed pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
        &quot;Năng suất của bạn đang ở mức cao nhất vào khung giờ 14h-16h. Soul Assistant đang chuẩn bị bối cảnh cho chương tiếp theo.&quot;
      </p>
    </div>
  )
}
