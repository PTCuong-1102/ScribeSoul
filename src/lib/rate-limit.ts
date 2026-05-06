import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const limiterCache = new Map<string, Ratelimit>()
type SlidingWindowDuration = Parameters<typeof Ratelimit.slidingWindow>[1]

function createLimiter(points: number, duration: SlidingWindowDuration) {
  const cacheKey = `${points}:${duration}`
  const cached = limiterCache.get(cacheKey)
  if (cached) return cached

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(points, duration),
  })

  limiterCache.set(cacheKey, limiter)
  return limiter
}

export async function checkRateLimit(
  key: string,
  points = 20,
  duration: SlidingWindowDuration = "1 h"
) {
  const limiter = createLimiter(points, duration)
  if (!limiter) return { success: true as const, remaining: points, reset: Date.now() }

  return limiter.limit(key)
}
