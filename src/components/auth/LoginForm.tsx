'use client'

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signInWithEmail } from "@/server/actions/auth"

export function LoginForm() {
  const [state, action, isPending] = useActionState(signInWithEmail, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-serif text-on-surface">Chào mừng trở lại</h1>
        <p className="font-sans text-on-surface-variant">Tiếp tục hành trình sáng tạo của bạn.</p>
      </div>

      {/* Social Login — UI đầy đủ, chờ kết nối OAuth */}
      <div className="space-y-3">
        <div className="relative">
          <Button
            variant="outline"
            disabled
            className="w-full h-12 flex items-center justify-center space-x-3 rounded-xl border-border/20 bg-surface-container-lowest dark:bg-surface-container transition-all opacity-60 cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span className="font-medium">Tiếp tục với Google</span>
          </Button>
          <span className="absolute -top-2 -right-2 bg-primary/90 text-primary-foreground text-[9px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
            Sắp có
          </span>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            disabled
            className="w-full h-12 flex items-center justify-center space-x-3 rounded-xl border-border/20 bg-surface-container-lowest dark:bg-surface-container transition-all opacity-60 cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="font-medium">Tiếp tục với GitHub</span>
          </Button>
          <span className="absolute -top-2 -right-2 bg-primary/90 text-primary-foreground text-[9px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
            Sắp có
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface dark:bg-surface-container-lowest px-2 text-on-surface-variant font-sans tracking-widest">
            Hoặc đăng nhập bằng Email
          </span>
        </div>
      </div>

      {/* Email + Password Form */}
      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-sans text-destructive">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="login-email" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant ml-1">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="elias@scribesoul.io"
            required
            className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest dark:bg-surface-container border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/30 text-on-surface font-sans"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant ml-1">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container-lowest dark:bg-surface-container border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/30 text-on-surface font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 font-sans font-medium"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <p className="text-center font-sans text-sm text-on-surface-variant">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Khởi tạo ngay
        </Link>
      </p>
    </div>
  )
}
