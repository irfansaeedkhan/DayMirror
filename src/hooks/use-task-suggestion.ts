import { useMemo } from "react";
import { format } from "date-fns";
import type { TaskDto } from "@/types/api";

type TaskLike = TaskDto & { occurrenceDate?: string };

export function useTaskSuggestion(tasks: TaskLike[], date: Date, hour: number): TaskDto | null {
  return useMemo(() => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    const dateStr = format(date, "yyyy-MM-dd");

    for (const task of tasks) {
      const onDay = task.occurrenceDate ?? task.date;
      if (onDay !== dateStr || !task.startAt) continue;
      const start = new Date(task.startAt);
      const end = task.endAt ? new Date(task.endAt) : new Date(start.getTime() + 60 * 60 * 1000);
      if (start < slotEnd && end > slotStart) return task;
    }

    return null;
  }, [tasks, date, hour]);
}
