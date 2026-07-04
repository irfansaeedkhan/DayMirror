"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useTasksInRange, useToggleCompletion } from "@/hooks/use-tasks";
import { CATEGORY_COLORS } from "@/lib/constants";
import { expandTasksForRange, type TaskOccurrence } from "@/lib/recurrence";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskDto } from "@/types/api";

type DayAgendaProps = {
  date: Date;
  onTaskClick: (task: TaskOccurrence<TaskDto>) => void;
};

export function DayAgenda({ date, onTaskClick }: DayAgendaProps) {
  const tasksQ = useTasksInRange(date, date);
  const toggle = useToggleCompletion();

  const sorted = useMemo(() => {
    if (!tasksQ.data) return [];
    const map = new Map<string, Set<string>>();
    tasksQ.data.completions.forEach((c) => {
      const set = map.get(c.taskId) ?? new Set();
      set.add(c.occurrenceDate);
      map.set(c.taskId, set);
    });
    return expandTasksForRange<TaskDto>(tasksQ.data.tasks, date, date, map).sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (String(a.startAt ?? "")).localeCompare(String(b.startAt ?? ""));
    });
  }, [tasksQ.data, date]);

  if (sorted.length === 0) {
    return (
      <p className="py-16 text-center text-base text-muted-foreground lg:py-24 lg:text-lg">
        No tasks for this day.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-elevated">
      {sorted.map((t) => (
        <li key={`${t.id}-${t.occurrenceDate}`} className="flex items-center gap-3 px-4 py-3 lg:gap-4 lg:px-6 lg:py-4">
          <Checkbox
            className="size-5"
            checked={t.occurrenceCompleted}
            onCheckedChange={(v) =>
              toggle.mutate({ taskId: t.id, date: t.occurrenceDate, completed: !!v })
            }
          />
          <button
            type="button"
            className="flex-1 cursor-pointer text-left"
            onClick={() => onTaskClick(t)}
          >
            <div
              className={cn(
                "text-base font-medium lg:text-lg",
                t.occurrenceCompleted && "text-muted-foreground line-through",
              )}
            >
              {t.title}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground lg:text-base">
              {t.allDay
                ? "All day"
                : t.startAt &&
                  `${format(new Date(t.startAt), "h:mm a")}${t.endAt ? ` – ${format(new Date(t.endAt), "h:mm a")}` : ""}`}
              <span className="mx-1.5">·</span>
              <span className="capitalize">{t.category}</span>
            </div>
          </button>
          <span
            className="size-2.5 shrink-0 rounded-full lg:size-3"
            style={{ background: CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other }}
          />
        </li>
      ))}
    </ul>
  );
}
