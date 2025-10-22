class Metrics {
  private counters = new Map<string, number>();
  
  increment(metric: string, value: number = 1): void {
    this.counters.set(metric, (this.counters.get(metric) || 0) + value);
  }
  
  getAll(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }
}

export const metrics = new Metrics();

// Usage
metrics.increment('api.geocoding.requests');
metrics.increment('api.geocoding.cache_hits');