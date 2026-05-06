/**
 * Environment Variables Validation
 * Validates all required env vars at startup
 */

import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth (optional but recommended)
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_ID: z.string().optional(),
  GOOGLE_SECRET: z.string().optional(),
  
  // AI/OpenAI
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o"),
  OPENAI_AUTOCOMPLETE_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  
  // Rate limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export type EnvConfig = z.infer<typeof envSchema>

let validated: EnvConfig | null = null

export function getEnv(): EnvConfig {
  if (validated) return validated

  try {
    validated = envSchema.parse(process.env)
    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .filter((issue) => issue.code === "invalid_type")
        .map((issue) => issue.path.join("."))
        .join(", ")

      throw new Error(
        `❌ Missing or invalid environment variables: ${missing}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

export function validateEnv() {
  getEnv()
  console.log("✅ Environment variables validated")
}
