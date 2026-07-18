const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse YYYY-MM-DD as local calendar date (no UTC timezone shift). Returns `null` for invalid input. */
export function parseDateOnly(dateStr: string): Date | null {
  if (!DATE_RE.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

/** Like `parseDateOnly` but falls back to `fallback` (default: today) on invalid input. */
export function parseDateOnlyOrFallback(dateStr: string, fallback?: Date): Date {
  return parseDateOnly(dateStr) ?? fallback ?? new Date();
}

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
