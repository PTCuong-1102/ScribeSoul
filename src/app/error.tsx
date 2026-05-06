"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    console.error("App Error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface dark:bg-surface-container-lowest">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-error/10 p-3">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif text-on-surface">Có lỗi xảy ra</h1>
          <p className="text-sm text-on-surface-variant">
            {error.message ||
              "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full"
          >
            Về trang chủ
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-destructive/10 rounded-lg text-left">
            <p className="text-xs font-mono text-destructive break-words">
              {error.digest && (
                <>
                  <span className="font-semibold">ID:</span> {error.digest}
                  <br />
                </>
              )}
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
