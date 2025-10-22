export function sanitizeQuery(query: string): string {
  return query.trim().slice(0, 100); 
}

export function validateDays(days: number): number {
  const sanitized = Math.floor(Math.abs(days));
  return Math.min(Math.max(sanitized, 1), 16);
}