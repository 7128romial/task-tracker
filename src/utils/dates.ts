import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  return format(startOfDay(new Date()), 'yyyy-MM-dd');
}

export function addDaysIsoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return format(d, 'yyyy-MM-dd');
}

/** Format an ISO date (YYYY-MM-DD) or datetime as DD/MM/YY. */
export function formatDDMMYY(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = iso.length <= 10 ? parseISO(iso) : new Date(iso);
    return format(d, 'dd/MM/yy');
  } catch {
    return '—';
  }
}

/**
 * Days from today until deadline (YYYY-MM-DD).
 * Positive = future, 0 = today, negative = past.
 */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  try {
    const d = iso.length <= 10 ? parseISO(iso) : new Date(iso);
    return differenceInCalendarDays(d, new Date());
  } catch {
    return null;
  }
}

export function isWithinNextDays(iso: string | null | undefined, n: number): boolean {
  const d = daysUntil(iso);
  if (d === null) return false;
  return d >= 0 && d <= n;
}

export function isOverdue(iso: string | null | undefined): boolean {
  const d = daysUntil(iso);
  return d !== null && d < 0;
}
