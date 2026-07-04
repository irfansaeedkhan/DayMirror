import { addDays, addMonths, isAfter, isBefore, isSameDay } from "date-fns";
import { formatDateOnly, parseDateOnly } from "./date-utils";

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
};

export type TaskOccurrence<T extends RecurringTask = RecurringTask> = T & {
  occurrenceDate: string;
  occurrenceCompleted: boolean;
};

function advanceCursor(cursor: Date, recurrence: RecurringTask["recurrence"]): Date {
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
      return addMonths(cursor, 1);
    default:
      return cursor;
  }
}

export function expandTasksForRange<T extends RecurringTask>(
  tasks: T[],
  rangeStart: Date,
  rangeEnd: Date,
  completionsByTask: Map<string, Set<string>> = new Map(),
): TaskOccurrence<T>[] {
  const out: TaskOccurrence<T>[] = [];

  for (const t of tasks) {
    const until = t.recurrenceUntil ? parseDateOnly(t.recurrenceUntil) : null;
    const completions = completionsByTask.get(t.id);

    const pushOccurrence = (occurrenceDate: string) => {
      const d = parseDateOnly(occurrenceDate);
      if (isBefore(d, rangeStart) && !isSameDay(d, rangeStart)) return;
      if (isAfter(d, rangeEnd) && !isSameDay(d, rangeEnd)) return;
      out.push({
        ...t,
        occurrenceDate,
        occurrenceCompleted: !!t.completedAt || (completions?.has(occurrenceDate) ?? false),
      });
    };

    if (t.recurrence === "none") {
      pushOccurrence(t.date);
      continue;
    }

    // Anchor day always uses the stored date string (avoids timezone off-by-one).
    pushOccurrence(t.date);

    let cursor = advanceCursor(parseDateOnly(t.date), t.recurrence);
    let safety = 0;

    while (safety++ < 800) {
      if (until && isAfter(cursor, until)) break;
      if (isAfter(cursor, rangeEnd)) break;

      const occurrenceDate = formatDateOnly(cursor);
      if (occurrenceDate !== t.date) {
        pushOccurrence(occurrenceDate);
      }

      cursor = advanceCursor(cursor, t.recurrence);
    }
  }

  return out;
}
