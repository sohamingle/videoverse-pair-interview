import { LRUCache } from 'lru-cache'
import type { MiddlewareHandler } from 'hono'

interface CachedResponse {
  body: string
  status: number
  headers: Record<string, string>
}

export const responseCache = new LRUCache<string, CachedResponse>({
  max: 100,
  ttl: 60 * 1000, // 60 seconds
})

export const invalidate = (key: string) =>{
  responseCache.delete(key)
}
 
export const invalidatePrefix = (prefix: string) => {
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key)
    }
  }
}

export const cacheMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    if (c.req.method !== 'GET') {
      return next()
    }

    const key = c.req.url.split('/api')[1]
    if (!key) {
      return next()
    }

    const cached = responseCache.get(key)

    if (cached) {
      c.header('X-Cache', 'HIT')
      // Restore headers
      Object.entries(cached.headers).forEach(([key, value]) => {
        c.header(key, value)
      })
      return new Response(cached.body, {
        status: cached.status,
        headers: cached.headers,
      })
    }

    await next()

    if (c.res.ok) {
      // Clone the response to read it without consuming the original
      const responseClone = c.res.clone()
      const body = await responseClone.text()

      // Store headers
      const headers: Record<string, string> = {}
      responseClone.headers.forEach((value, key) => {
        headers[key] = value
      })

      responseCache.set(key, {
        body,
        status: responseClone.status,
        headers,
      })

      c.header('X-Cache', 'MISS')
    }
  }
}