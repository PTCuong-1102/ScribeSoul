"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_error: Error): State {
    void _error
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/15 text-destructive font-sans space-y-2">
          <h4 className="font-bold">Đã xảy ra lỗi hệ thống</h4>
          <p className="text-xs">Không thể hiển thị phần này. Vui lòng tải lại trang hoặc thử lại sau.</p>
        </div>
      )
    }

    return this.props.children
  }
}
