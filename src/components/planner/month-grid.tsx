"use client";

import { useMemo } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useTasksInRange } from "@/hooks/use-tasks";
import { CATEGORY_COLORS } from "@/lib/constants";
import { expandTasksForRange, type TaskOccurrence } from "@/lib/recurrence";
import { buildCompletionsMap, buildProgressMap } from "@/lib/task-progress-maps";
import { cn } from "@/lib/utils";
import type { TaskDto } from "@/types/api";

type MonthGridProps = {
  date: Date;
  onDayClick: (date: Date) => void;
  onTaskClick: (task: TaskOccurrence<TaskDto>) => void;
};

export function MonthGrid({ date, onDayClick, onTaskClick }: MonthGridProps) {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(date));

  const tasksQ = useTasksInRange(gridStart, gridEnd);

  const occurrences = useMemo(() => {
    if (!tasksQ.data) return [];
    return expandTasksForRange<TaskDto>(
      tasksQ.data.tasks,
      gridStart,
      gridEnd,
      buildCompletionsMap(tasksQ.data.completions),
      buildProgressMap(tasksQ.data.progress ?? []),
    );
  }, [tasksQ.data, gridStart, gridEnd]);

  const byDate = useMemo(() => {
    const m = new Map<string, TaskOccurrence<TaskDto>[]>();
    occurrences.forEach((o) => {
      const arr = m.get(o.occurrenceDate) ?? [];
      arr.push(o);
      m.set(o.occurrenceDate, arr);
    });
    return m;
  }, [occurrences]);

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-elevated">
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="p-2 text-center text-xs font-medium text-muted-foreground sm:text-sm lg:p-3 lg:text-base"
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.slice(0, 1)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const tasks = byDate.get(key) ?? [];
          const inMonth = isSameMonth(d, date);

          return (
            <div
              key={key}
              className={cn(
                "group min-h-[5.5rem] cursor-pointer border-b border-r border-border/50 p-1.5 transition hover:bg-hover sm:min-h-[7rem] lg:min-h-[8.5rem] lg:p-2 xl:min-h-[10rem]",
                !inMonth && "bg-muted/20",
              )}
              onClick={() => onDayClick(d)}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-grid size-7 place-items-center rounded-full text-sm sm:size-8 lg:size-9 lg:text-base",
                    isToday(d)
                      ? "bg-primary font-semibold text-primary-foreground"
                      : !inMonth
                        ? "text-muted-foreground/60"
                        : "text-foreground",
                  )}
                >
                  {format(d, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {tasks.slice(0, 3).map((t) => (
                  <button
                    key={`${t.id}-${t.occurrenceDate}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(t);
                    }}
                    className={cn(
                      "block w-full cursor-pointer truncate rounded-md px-1.5 py-0.5 text-left text-[11px] transition hover:opacity-80 sm:text-xs lg:px-2 lg:py-1 lg:text-sm",
                      t.occurrenceCompleted && "line-through opacity-50",
                    )}
                    style={{
                      background: `color-mix(in oklch, ${CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other} 18%, transparent)`,
                      color: CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other,
                    }}
                  >
                    {!t.allDay && t.startAt && (
                      <span className="mr-1 opacity-70">{format(new Date(t.startAt), "HH:mm")}</span>
                    )}
                    {t.title}
                  </button>
                ))}
                {tasks.length > 3 && (
                  <div className="px-1.5 text-[10px] text-muted-foreground sm:text-xs lg:text-sm">
                    +{tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
