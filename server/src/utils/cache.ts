import { DailyForecast } from "@/types/models.js";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const weatherCache = new SimpleCache<DailyForecast[]>();