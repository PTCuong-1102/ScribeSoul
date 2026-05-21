import { validateEnv } from "@/lib/env"

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    validateEnv()
  }
}
