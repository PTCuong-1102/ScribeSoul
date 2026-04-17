import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-surface dark:bg-surface-container-lowest">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-surface-container-low dark:bg-surface relative overflow-hidden">
        {/* Artistic background overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] dark:opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5"></div>
        
        <div className="relative z-10 max-w-lg text-center space-y-6">
          <blockquote className="text-4xl font-serif italic text-on-surface leading-tight">
            &quot;Viết không phải là mô tả, mà là khám phá vẻ đẹp của sự im lặng giữa những câu chữ.&quot;
          </blockquote>
          <p className="font-sans text-on-surface-variant uppercase tracking-widest text-sm">
            — The Silent Manuscript —
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-12 left-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-12 right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  )
}
