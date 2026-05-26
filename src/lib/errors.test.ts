import { describe, it, expect } from "vitest"
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  isAppError,
  errorToResponse,
} from "./errors"

describe("Custom Error Classes", () => {
  it("creates AppError with default status 500", () => {
    const err = new AppError("Something went wrong")
    expect(err.message).toBe("Something went wrong")
    expect(err.statusCode).toBe(500)
    expect(err.code).toBeUndefined()
  })

  it("creates ValidationError with 400 status", () => {
    const err = new ValidationError("Invalid input")
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe("VALIDATION_ERROR")
  })

  it("creates AuthenticationError with 401 status", () => {
    const err = new AuthenticationError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe("AUTHENTICATION_ERROR")
    expect(err.message).toBe("Unauthorized")
  })

  it("creates AuthorizationError with 403 status", () => {
    const err = new AuthorizationError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe("AUTHORIZATION_ERROR")
  })

  it("creates NotFoundError with 404 status", () => {
    const err = new NotFoundError()
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe("NOT_FOUND_ERROR")
  })

  it("creates ConflictError with 409 status", () => {
    const err = new ConflictError("Resource already exists")
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe("CONFLICT_ERROR")
    expect(err.message).toBe("Resource already exists")
  })

  it("creates RateLimitError with 429 status", () => {
    const err = new RateLimitError()
    expect(err.statusCode).toBe(429)
    expect(err.code).toBe("RATE_LIMIT_ERROR")
  })
})

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new AppError("test"))).toBe(true)
    expect(isAppError(new ValidationError("test"))).toBe(true)
  })

  it("returns false for regular Error", () => {
    expect(isAppError(new Error("test"))).toBe(false)
  })

  it("returns false for non-Error values", () => {
    expect(isAppError("string")).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError(undefined)).toBe(false)
    expect(isAppError({})).toBe(false)
  })
})

describe("errorToResponse", () => {
  it("formats AppError correctly", () => {
    const err = new NotFoundError("Document not found")
    const resp = errorToResponse(err)
    expect(resp).toEqual({
      statusCode: 404,
      message: "Document not found",
      code: "NOT_FOUND_ERROR",
      details: undefined,
    })
  })

  it("formats unknown errors as 500", () => {
    const resp = errorToResponse(new Error("Unexpected"))
    expect(resp.statusCode).toBe(500)
    expect(resp.message).toBe("Internal server error")
    expect(resp.code).toBe("INTERNAL_ERROR")
  })
})
