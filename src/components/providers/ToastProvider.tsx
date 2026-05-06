"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system" | undefined}
      position="top-right"
      richColors
      expand
      duration={4000}
    />
  )
}
