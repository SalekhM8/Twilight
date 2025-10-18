type CacheEntry<T> = { value: T; expiresAt: number }

const memoryCache = new Map<string, CacheEntry<unknown>>()

export async function getOrSetCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = memoryCache.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value as T
  }
  const value = await fetcher()
  memoryCache.set(key, { value, expiresAt: now + ttlMs })
  return value
}

export function clearCache(key?: string) {
  if (key) memoryCache.delete(key)
  else memoryCache.clear()
}


