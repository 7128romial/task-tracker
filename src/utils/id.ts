export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const rnd = () => Math.random().toString(36).slice(2, 10);
  return `${rnd()}-${rnd()}-${Date.now().toString(36)}`;
}

/**
 * Short engineering-style ID shown in the table, e.g. "t_k29a7f1".
 * Stable for a given full id.
 */
export function shortId(fullId: string): string {
  const clean = fullId.replace(/-/g, '').toLowerCase();
  return `t_${clean.slice(0, 7)}`;
}
