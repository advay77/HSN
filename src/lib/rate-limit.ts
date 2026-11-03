import 'server-only'

import { headers } from 'next/headers'

// Fixed-window limiter. On Vercel each request may run on a different instance, so counts are kept in
// Upstash Redis when it is configured (Vercel → Storage → Upstash sets KV_REST_API_URL / KV_REST_API_TOKEN,
// or set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Without it, or if Redis can't be reached,
// counts are kept in this instance's memory.
const buckets = new Map<string, { count: number; resetAt: number }>()

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

// Vercel replaces x-forwarded-for with the real client address, so it can't be spoofed there.
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

function memoryHit(id: string, windowSec: number): number {
  const now = Date.now()
  const b = buckets.get(id)
  if (!b || b.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowSec * 1000 })
    if (buckets.size > 50_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
    return 1
  }
  return ++b.count
}

async function redisHit(id: string, windowSec: number): Promise<number | null> {
  const url = redisUrl()
  const token = redisToken()
  if (!url || !token) return null
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', `rl:${id}`],
        ['EXPIRE', `rl:${id}`, String(windowSec), 'NX'],
      ]),
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    })
    if (!res.ok) return null
    const [incr] = (await res.json()) as { result?: number }[]
    return typeof incr?.result === 'number' ? incr.result : null
  } catch {
    return null
  }
}

/** Counts one hit for `name` from this visitor's IP. Returns false once `limit` hits happen within `windowSec`. */
export async function rateLimit(name: string, limit: number, windowSec: number, key?: string): Promise<boolean> {
  const id = `${name}:${key ?? (await clientIp())}`
  const count = (await redisHit(id, windowSec)) ?? memoryHit(id, windowSec)
  return count <= limit
}

export const TOO_MANY = 'Too many attempts from your connection. Please wait a few minutes and try again.'
