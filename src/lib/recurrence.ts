import { addDays, isAfter, isBefore, isSameDay } from "date-fns";
import { formatDateOnly, parseDateOnlyOrFallback } from "./date-utils";

export type RecurringTask = {
  id: string;
  date: string;
  startAt?: string | Date | null;
  endAt?: string | Date | null;
  allDay: boolean;
  category: string;
  recurrence: "none" | "daily" | "weekdays" | "weekly" | "monthly";
  recurrenceUntil?: string | null;
  completedAt?: string | Date | null;
  title: string;
  notes?: string | null;
  priority?: string;
  color?: string;
  userId?: string;
  trackMode?: "checkbox" | "quantity";
  targetValue?: number | null;
  unit?: string | null;
  stepValue?: number | null;
};

export type TaskOccurrence<T extends RecurringTask = RecurringTask> = T & {
  occurrenceDate: string;
  occurrenceCompleted: boolean;
  /** Quantity logged for this occurrence (0 if none / checkbox mode). */
  occurrenceAmount: number;
};

/** Project a stored timestamp's clock time onto a calendar day (local). */
export function projectTimeOntoDate(
  source: string | Date | null | undefined,
  occurrenceDate: string,
): string | null {
  if (source == null) return null;
  const src = typeof source === "string" ? new Date(source) : source;
  if (Number.isNaN(src.getTime())) return null;
  const base = parseDateOnlyOrFallback(occurrenceDate);
  const projected = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    src.getHours(),
    src.getMinutes(),
    src.getSeconds(),
    src.getMilliseconds(),
  );
  return projected.toISOString();
}

/** Advance by one month but keep the intended day-of-month (clamp for short months). */
function addMonthsClamped(date: Date, months: number, dayOfMonth: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dayOfMonth, lastDay));
}

function advanceCursor(
  cursor: Date,
  recurrence: RecurringTask["recurrence"],
  dayOfMonth: number,
): Date {
  switch (recurrence) {
    case "daily":
      return addDays(cursor, 1);
    case "weekdays": {
      let next = addDays(cursor, 1);
      while ([0, 6].includes(next.getDay())) next = addDays(next, 1);
      return next;
    }
    case "weekly":
      return addDays(cursor, 7);
    case "monthly":
      return addMonthsClamped(cursor, 1, dayOfMonth);
    default:
      return cursor;
  }
}

export function expandTasksForRange<T extends RecurringTask>(
  tasks: T[],
  rangeStart: Date,
  rangeEnd: Date,
  completionsByTask: Map<string, Set<string>> = new Map(),
  progressByTask: Map<string, Map<string, number>> = new Map(),
): TaskOccurrence<T>[] {
  const out: TaskOccurrence<T>[] = [];

  for (const t of tasks) {
    const until = t.recurrenceUntil ? parseDateOnlyOrFallback(t.recurrenceUntil) : null;
    const completions = completionsByTask.get(t.id);
    const progressDates = progressByTask.get(t.id);

    const pushOccurrence = (occurrenceDate: string) => {
      const d = parseDateOnlyOrFallback(occurrenceDate);
      if (isBefore(d, rangeStart) && !isSameDay(d, rangeStart)) return;
      if (isAfter(d, rangeEnd) && !isSameDay(d, rangeEnd)) return;

      const occurrenceAmount = progressDates?.get(occurrenceDate) ?? 0;
      const target = t.targetValue ?? 0;
      const quantityDone =
        t.trackMode === "quantity" && target > 0 ? occurrenceAmount >= target : false;

      // Recurring completion is per-occurrence only — never treat series `completedAt` as all done.
      const occurrenceCompleted =
        quantityDone ||
        (t.recurrence === "none"
          ? !!t.completedAt || (completions?.has(occurrenceDate) ?? false)
          : (completions?.has(occurrenceDate) ?? false));

      out.push({
        ...t,
        occurrenceDate,
        occurrenceCompleted,
        occurrenceAmount,
        startAt: t.allDay ? t.startAt : projectTimeOntoDate(t.startAt, occurrenceDate),
        endAt: t.allDay ? t.endAt : projectTimeOntoDate(t.endAt, occurrenceDate),
      });
    };

    if (t.recurrence === "none") {
      pushOccurrence(t.date);
      continue;
    }

    const anchor = parseDateOnlyOrFallback(t.date);
    // Snap weekdays series to the first Mon–Fri on/after the anchor.
    let first = anchor;
    if (t.recurrence === "weekdays") {
      while ([0, 6].includes(first.getDay())) first = addDays(first, 1);
    }

    const dayOfMonth = first.getDate();

    // Prefer stored date string for the true anchor day (avoids timezone off-by-one).
    pushOccurrence(isSameDay(first, anchor) ? t.date : formatDateOnly(first));

    let cursor = advanceCursor(first, t.recurrence, dayOfMonth);
    let safety = 0;

    while (safety++ < 800) {
      if (until && isAfter(cursor, until)) break;
      if (isAfter(cursor, rangeEnd)) break;

      pushOccurrence(formatDateOnly(cursor));
      cursor = advanceCursor(cursor, t.recurrence, dayOfMonth);
    }
  }

  return out;
}
