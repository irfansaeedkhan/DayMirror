"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useToggleCompletion } from "@/hooks/use-tasks";
import { useTasksForDay } from "@/hooks/use-tasks-for-day";
import { TaskProgressSheet } from "@/components/tasks/task-progress-sheet";
import { CATEGORY_COLORS } from "@/lib/constants";
import { type TaskOccurrence } from "@/lib/recurrence";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskDto } from "@/types/api";

type DayAgendaProps = {
  date: Date;
  onTaskClick: (task: TaskOccurrence<TaskDto>) => void;
};

export function DayAgenda({ date, onTaskClick }: DayAgendaProps) {
  const { occurrences } = useTasksForDay(date);
  const toggle = useToggleCompletion();
  const [progressTask, setProgressTask] = useState<TaskOccurrence<TaskDto> | null>(null);

  const sorted = useMemo(() => {
    return [...occurrences].sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (String(a.startAt ?? "")).localeCompare(String(b.startAt ?? ""));
    });
  }, [occurrences]);

  if (sorted.length === 0) {
    return (
      <p className="py-16 text-center text-base text-muted-foreground lg:py-24 lg:text-lg">
        No tasks for this day.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-elevated">
        {sorted.map((t) => {
          const isQty = t.trackMode === "quantity" && t.targetValue != null;
          const amount = t.occurrenceAmount ?? 0;
          const target = t.targetValue ?? 0;
          const pct = target > 0 ? Math.min(100, (amount / target) * 100) : 0;

          return (
            <li key={`${t.id}-${t.occurrenceDate}`} className="flex flex-col gap-2 px-4 py-3 lg:gap-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                {isQty ? (
                  <button
                    type="button"
                    onClick={() => setProgressTask(t)}
                    className={cn(
                      "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border text-xs font-semibold tabular-nums",
                      t.occurrenceCompleted
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-muted/40 text-foreground",
                    )}
                    aria-label={`Log progress for ${t.title}`}
                  >
                    {amount}
                  </button>
                ) : (
                  <Checkbox
                    className="size-5"
                    checked={t.occurrenceCompleted}
                    onCheckedChange={(v) =>
                      toggle.mutate({ taskId: t.id, date: t.occurrenceDate, completed: !!v })
                    }
                  />
                )}
                <button
                  type="button"
                  className="min-w-0 flex-1 cursor-pointer text-left"
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
                    {isQty ? (
                      <span>
                        {amount}/{target} {t.unit}
                        {t.occurrenceCompleted
                          ? " · Completed"
                          : amount > 0
                            ? " · Partially completed"
                            : ""}
                      </span>
                    ) : (
                      <>
                        {t.allDay
                          ? "All day"
                          : t.startAt &&
                            `${format(new Date(t.startAt), "h:mm a")}${t.endAt ? ` – ${format(new Date(t.endAt), "h:mm a")}` : ""}`}
                        <span className="mx-1.5">·</span>
                        <span className="capitalize">{t.category}</span>
                      </>
                    )}
                  </div>
                </button>
                <span
                  className="size-2.5 shrink-0 rounded-full lg:size-3"
                  style={{ background: CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other }}
                />
              </div>
              {isQty ? (
                <div className="ml-12 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      t.occurrenceCompleted ? "bg-emerald-500" : "bg-primary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <TaskProgressSheet task={progressTask} onClose={() => setProgressTask(null)} />
    </>
  );
}
