interface CacheEntry {
  data: any;
  timestamp: number;
}

const TTL = 60 * 60 * 1000; // 1 hour in ms
const cache = new Map<string, CacheEntry>();

export function getCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}
