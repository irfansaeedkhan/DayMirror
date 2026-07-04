"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, isSameDay } from "date-fns";
import { parseDateOnly } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HourRow } from "@/components/tracker/hour-row";
import { TaskAttachDrawer } from "@/components/tracker/task-attach-drawer";
import { useDayHourLogs } from "@/hooks/use-tracker";
import { useTasksInRange } from "@/hooks/use-tasks";
import { useTaskSuggestion } from "@/hooks/use-task-suggestion";
import { HOURS_IN_DAY } from "@/lib/constants";
import type { HourLogDto, TaskDto } from "@/types/api";

export function TrackerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const current = dateParam ? parseDateOnly(dateParam) : new Date();
  const dateStr = format(current, "yyyy-MM-dd");
  const isToday = isSameDay(current, new Date());
  const nowHour = new Date().getHours();

  const logsQ = useDayHourLogs(current);
  const tasksQ = useTasksInRange(current, current);

  const hours = useMemo(() => {
    const settings = logsQ.data?.settings;
    const start = settings?.defaultStartHour ?? 1;
    const end = settings?.defaultEndHour ?? 23;
    return HOURS_IN_DAY.filter((h) => h >= start && h <= end);
  }, [logsQ.data?.settings]);

  const logsByHour = useMemo(() => {
    const m = new Map<number, HourLogDto>();
    (logsQ.data?.logs ?? []).forEach((l) => m.set(l.hour, l));
    return m;
  }, [logsQ.data?.logs]);

  const todayTasks = useMemo(
    () => (tasksQ.data?.tasks ?? []).filter((t) => t.date === dateStr),
    [tasksQ.data?.tasks, dateStr],
  );

  const defaultExpanded = isToday && hours.includes(nowHour) ? nowHour : hours[0] ?? 9;
  const [expandedHour, setExpandedHour] = useState(defaultExpanded);
  const [drawerHour, setDrawerHour] = useState<number | null>(null);

  useEffect(() => {
    setExpandedHour(defaultExpanded);
  }, [defaultExpanded]);

  const setDate = (d: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(d, "yyyy-MM-dd"));
    router.push(`/tracker?${params.toString()}`);
  };

  const summary = useMemo(() => {
    const logs = logsQ.data?.logs ?? [];
    const success = logs.filter((l) => l.mood === "success").length;
    const linked = logs.reduce((sum, l) => sum + l.linkedTaskIds.length, 0);
    const avg = logs.length
      ? Math.round(logs.reduce((s, l) => s + l.productivity, 0) / logs.length)
      : 0;
    return { success, linked, total: logs.length, avg };
  }, [logsQ.data?.logs]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-12 lg:max-w-4xl lg:space-y-6 xl:max-w-5xl">
      <div className="flex items-center gap-3 lg:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl xl:text-4xl">
            {format(current, "EEEE, MMM d")}
          </h1>
          <p className="text-sm text-muted-foreground lg:text-base">Reflect on each hour — the day writes itself.</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={() => setDate(addDays(current, -1))} className="rounded-full" aria-label="Previous day">
            <ChevronLeft className="size-4 lg:size-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDate(new Date())} className="rounded-full lg:text-base">
            Today
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setDate(addDays(current, 1))} className="rounded-full" aria-label="Next day">
            <ChevronRight className="size-4 lg:size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
        <Stat label="Avg productivity" value={`${summary.avg}%`} />
        <Stat label="Success hours" value={String(summary.success)} />
        <Stat label="Linked tasks" value={String(summary.linked)} />
        <Stat label="Hours logged" value={`${summary.total}/${hours.length}`} />
      </div>

      <div className="relative">
        <div className="absolute left-[68px] top-3 bottom-3 w-px bg-border/70" aria-hidden />
        <div className="space-y-2">
          {hours.map((h) => (
            <TrackerHourSlot
              key={h}
              hour={h}
              date={dateStr}
              currentDate={current}
              log={logsByHour.get(h)}
              tasks={todayTasks}
              isCurrent={isToday && h === nowHour}
              expanded={expandedHour === h}
              onToggle={() => setExpandedHour(expandedHour === h ? -1 : h)}
              onOpenDrawer={() => setDrawerHour(h)}
            />
          ))}
        </div>
      </div>

      <TaskAttachDrawer
        open={drawerHour !== null}
        onClose={() => setDrawerHour(null)}
        hour={drawerHour}
        date={dateStr}
        tasks={todayTasks}
        log={drawerHour !== null ? logsByHour.get(drawerHour) : undefined}
      />
    </div>
  );
}

function TrackerHourSlot(props: {
  hour: number;
  date: string;
  currentDate: Date;
  log?: HourLogDto;
  tasks: TaskDto[];
  isCurrent: boolean;
  expanded: boolean;
  onToggle: () => void;
  onOpenDrawer: () => void;
}) {
  const suggestion = useTaskSuggestion(
    props.tasks,
    props.currentDate,
    props.expanded ? props.hour : -1,
  );
  const attachedIds = new Set(props.log?.linkedTaskIds ?? []);
  const showSuggestion = suggestion && !attachedIds.has(suggestion.id) ? suggestion : null;

  return (
    <HourRow
      {...props}
      suggestion={showSuggestion}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-elevated lg:p-4">
      <div className="text-xs text-muted-foreground lg:text-sm">{label}</div>
      <div className="mt-0.5 text-lg font-semibold lg:text-xl">{value}</div>
    </div>
  );
}
