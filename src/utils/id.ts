export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const rnd = () => Math.random().toString(36).slice(2, 10);
  return `${rnd()}-${rnd()}-${Date.now().toString(36)}`;
}
