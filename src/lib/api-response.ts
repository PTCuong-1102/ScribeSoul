/**
 * API Response Utilities
 * Standardized response handling for API routes
 */

import { NextResponse } from "next/server"
import { errorToResponse } from "./errors"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, string>
  }
  meta?: {
    timestamp: string
    path: string
  }
}

/**
 * Success response
 */
export function apiSuccess<T>(
  data: T,
  statusCode: number = 200,
  meta?: Omit<ApiResponse["meta"], "timestamp" | "path">
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path: "",
        ...meta,
      },
    },
    { status: statusCode }
  )
}

/**
 * Error response
 */
export function apiError(
  error: unknown,
  defaultStatusCode: number = 500
): NextResponse<ApiResponse> {
  const errorResponse = errorToResponse(error)

  return NextResponse.json(
    {
      success: false,
      error: {
        message: errorResponse.message,
        code: errorResponse.code,
        details: errorResponse.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: "",
      },
    },
    { status: errorResponse.statusCode || defaultStatusCode }
  )
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandling<T>(
  handler: (req: Request) => Promise<NextResponse<T>>
) {
  return async (req: Request): Promise<NextResponse<T | ApiResponse>> => {
    try {
      return await handler(req)
    } catch (error) {
      return apiError(error) as NextResponse<T | ApiResponse>
    }
  }
}
