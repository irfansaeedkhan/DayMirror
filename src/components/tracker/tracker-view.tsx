"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, isSameDay } from "date-fns";
import { parseDateOnlyOrFallback } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight, ClipboardList, Flame, Package, Trophy, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HourRow } from "@/components/tracker/hour-row";
import { RestPeriodRow } from "@/components/tracker/rest-period-row";
import { SessionTimelineSection } from "@/components/tracker/session-timeline-section";
import { TaskAttachDrawer } from "@/components/tracker/task-attach-drawer";
import { TrackerSessionsBar } from "@/components/tracker/tracker-sessions-panel";
import { useDayHourLogs } from "@/hooks/use-tracker";
import { useTasksForDay } from "@/hooks/use-tasks-for-day";
import { useTaskSuggestion } from "@/hooks/use-task-suggestion";
import { resolveHourXp } from "@/lib/hour-xp";
import { buildSessionTimeline } from "@/lib/session-timeline";
import { formatSessionName } from "@/lib/session-overlap";
import { groupSessionTimeline, sessionContainsHour } from "@/lib/timeline-sections";
import { cn } from "@/lib/utils";
import type { HourLogDto, TaskDto } from "@/types/api";

export function TrackerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const current = dateParam ? parseDateOnlyOrFallback(dateParam) : new Date();
  const dateStr = format(current, "yyyy-MM-dd");
  const isToday = isSameDay(current, new Date());
  const nowHour = new Date().getHours();

  const logsQ = useDayHourLogs(current);
  const tasksQ = useTasksForDay(current);

  const settings = logsQ.data?.settings;
  const sessions = logsQ.data?.sessions ?? [];

  const todayTasks = useMemo(() => tasksQ.occurrences, [tasksQ.occurrences]);

  const sessionSections = useMemo(() => {
    if (sessions.length === 0) return [];
    const timeline = buildSessionTimeline(sessions);
    return groupSessionTimeline(timeline, sessions);
  }, [sessions]);

  const visibleHours = useMemo(
    () => sessionSections.flatMap((s) => (s.kind === "session" ? s.hours : [])),
    [sessionSections],
  );

  const logsByHour = useMemo(() => {
    const m = new Map<number, HourLogDto>();
    (logsQ.data?.logs ?? []).forEach((l) => m.set(l.hour, l));
    return m;
  }, [logsQ.data?.logs]);

  const [expandedHour, setExpandedHour] = useState(-1);
  const [drawerHour, setDrawerHour] = useState<number | null>(null);
  const [collapsedSessions, setCollapsedSessions] = useState<Set<string>>(() => new Set());
  const autoFocusedDateRef = useRef<string | null>(null);

  useEffect(() => {
    autoFocusedDateRef.current = null;
    setExpandedHour(-1);
  }, [dateStr]);

  useEffect(() => {
    if (logsQ.isLoading || autoFocusedDateRef.current === dateStr) return;

    if (!isToday) {
      autoFocusedDateRef.current = dateStr;
      return;
    }

    if (!visibleHours.includes(nowHour)) {
      if (visibleHours.length > 0) autoFocusedDateRef.current = dateStr;
      return;
    }

    autoFocusedDateRef.current = dateStr;
    setExpandedHour(nowHour);

    const sessionWithNow = sessionSections.find(
      (section): section is Extract<typeof section, { kind: "session" }> =>
        section.kind === "session" && section.hours.includes(nowHour),
    );
    if (sessionWithNow) {
      setCollapsedSessions((prev) => {
        if (!prev.has(sessionWithNow.sessionId)) return prev;
        const next = new Set(prev);
        next.delete(sessionWithNow.sessionId);
        return next;
      });
    }
  }, [dateStr, isToday, nowHour, visibleHours, sessionSections, logsQ.isLoading]);

  const setDate = (d: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(d, "yyyy-MM-dd"));
    router.push(`/tracker?${params.toString()}`);
  };

  const summary = useMemo(() => {
    const logs = logsQ.data?.logs ?? [];
    const success = logs.filter((l) => l.mood === "success").length;
    const linked = logs.reduce((sum, l) => sum + l.linkedTaskIds.length, 0);
    const scored = logs
      .map((l) => resolveHourXp(l.mood, l.productivity))
      .filter((xp): xp is number => xp !== null);
    const dayScore = scored.length
      ? Math.round(scored.reduce((s, xp) => s + xp, 0) / scored.length)
      : 0;
    return { success, linked, total: logs.length, dayScore, scoredCount: scored.length };
  }, [logsQ.data?.logs]);

  const dayScoreValue = summary.scoredCount > 0 ? `${summary.dayScore}%` : "—";
  const hoursValue = `${summary.total}/${visibleHours.length}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-16 sm:space-y-4 sm:pb-10 lg:max-w-4xl lg:space-y-5 xl:max-w-5xl">
      {/* Phase 4: sticky date + nav on mobile scroll */}
      <div className="sticky top-0 z-10 -mx-3 border-b border-border/40 bg-background/95 px-3 py-2 backdrop-blur-sm sm:static sm:mx-0 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {format(current, "EEEE, MMM d")}
            </h2>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDate(addDays(current, -1))}
              aria-label="Previous day"
            >
              <ChevronLeft />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDate(new Date())}>
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDate(addDays(current, 1))}
              aria-label="Next day"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Phase 1 + 3 + 4: stats — compact chips on desktop; day score + hours only on mobile */}
      <div className="mt-1 flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <StatMeta icon={Flame} value={dayScoreValue} label="day score" />
        <StatMeta
          icon={Trophy}
          value={String(summary.success)}
          label="success hours"
          className="hidden sm:inline-flex"
        />
        <StatMeta
          icon={Package}
          value={String(summary.linked)}
          label={summary.linked === 1 ? "linked task" : "linked tasks"}
          className="hidden sm:inline-flex"
        />
        <StatMeta icon={ClipboardList} value={hoursValue} label="hours" />
      </div>

      <TrackerSessionsBar
        date={dateStr}
        sessions={sessions}
        defaultStartHour={settings?.defaultStartHour ?? 9}
        defaultEndHour={settings?.defaultEndHour ?? 17}
        nowHour={isToday ? nowHour : undefined}
      />

      <div className="relative">
        <div className="space-y-4">
          {sessionSections.length === 0 && !logsQ.isLoading && (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-elevated">
              No session hours to show yet. Use Edit or Add session above to set your hours.
            </p>
          )}
          {sessionSections.map((section) => {
            if (section.kind === "rest") {
              return (
                <RestPeriodRow
                  key={`rest-${section.startHour}-${section.endHour}`}
                  startHour={section.startHour}
                  endHour={section.endHour}
                />
              );
            }
            const isActive =
              isToday && nowHour !== undefined && sessionContainsHour(section, nowHour);
            const sessionExpanded = !collapsedSessions.has(section.sessionId);

            return (
              <SessionTimelineSection
                key={section.sessionId}
                name={formatSessionName(section.name)}
                startHour={section.startHour}
                endHour={section.endHour}
                isActive={isActive}
                expanded={sessionExpanded}
                onToggle={() => {
                  setCollapsedSessions((prev) => {
                    const next = new Set(prev);
                    if (next.has(section.sessionId)) next.delete(section.sessionId);
                    else next.add(section.sessionId);
                    return next;
                  });
                }}
              >
                {section.hours.map((h) => (
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
              </SessionTimelineSection>
            );
          })}
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

function StatMeta({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "sm:rounded-full sm:bg-secondary/50 sm:px-2.5 sm:py-1",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
      <span>
        <span className="font-medium tabular-nums text-foreground">{value}</span>
        <span className="text-muted-foreground"> {label}</span>
      </span>
    </span>
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
