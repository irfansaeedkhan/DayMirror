import { useMemo } from "react";
import { format } from "date-fns";
import { expandTasksForRange, type TaskOccurrence } from "@/lib/recurrence";
import { buildCompletionsMap, buildProgressMap } from "@/lib/task-progress-maps";
import type { TaskDto } from "@/types/api";
import { useTasksInRange } from "./use-tasks";

/**
 * Loads tasks for a single day, including recurring occurrences.
 * Server findInRange already returns recurring series that overlap the day
 * even when the anchor date is earlier.
 */
export function useTasksForDay(date: Date) {
  const query = useTasksInRange(date, date);
  const dateStr = format(date, "yyyy-MM-dd");

  const occurrences = useMemo((): TaskOccurrence<TaskDto>[] => {
    if (!query.data) return [];
    return expandTasksForRange(
      query.data.tasks,
      date,
      date,
      buildCompletionsMap(query.data.completions),
      buildProgressMap(query.data.progress ?? []),
    );
  }, [query.data, date]);

  return { ...query, occurrences, dateStr };
}
