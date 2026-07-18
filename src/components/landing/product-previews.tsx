import { Check } from "lucide-react";
import { CATEGORY_COLORS, MOOD_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_CELLS: {
  day: number;
  inMonth: boolean;
  today?: boolean;
  tasks: { title: string; category: string; time?: string }[];
}[] = [
  { day: 1, inMonth: true, tasks: [{ title: "Weekly review", category: "work" }] },
  { day: 2, inMonth: true, tasks: [] },
  { day: 3, inMonth: true, tasks: [{ title: "Gym", category: "health", time: "07:00" }] },
  { day: 4, inMonth: true, tasks: [] },
  { day: 5, inMonth: true, tasks: [] },
  { day: 6, inMonth: true, tasks: [{ title: "Family dinner", category: "personal" }] },
  { day: 7, inMonth: true, tasks: [] },
  { day: 8, inMonth: true, tasks: [{ title: "Deep work block", category: "work", time: "09:00" }] },
  { day: 9, inMonth: true, tasks: [{ title: "Read 30 min", category: "learning" }] },
  { day: 10, inMonth: true, tasks: [], today: true },
  { day: 11, inMonth: true, tasks: [{ title: "Sprint planning", category: "work" }] },
  { day: 12, inMonth: true, tasks: [] },
  { day: 13, inMonth: true, tasks: [] },
  { day: 14, inMonth: true, tasks: [{ title: "Meal prep", category: "health" }] },
];

const SAMPLE_HOURS = [
  { hour: 9, label: "9:00 AM", mood: "success" as const, text: "Deep work on project proposal", task: "Write brief" },
  { hour: 10, label: "10:00 AM", mood: "moderate" as const, text: "Email and Slack catch-up", task: null },
  { hour: 11, label: "11:00 AM", mood: "in_progress" as const, text: "Team standup + planning", task: "Sprint review" },
  { hour: 12, label: "12:00 PM", mood: "wasted" as const, text: "Scrolled feeds longer than planned", task: null },
];

const DAY_TASKS = [
  { title: "Deep work block", category: "work", time: "9:00 AM", done: true },
  { title: "Team standup", category: "work", time: "11:00 AM", done: false },
  { title: "Read 30 minutes", category: "learning", time: "All day", done: false },
];

const ANALYTICS_ROWS = [
  { date: "Jul 10", hour: "9:00 AM", notes: "Deep work on proposal", mood: "success" as const, productivity: 85 },
  { date: "Jul 10", hour: "10:00 AM", notes: "Email catch-up", mood: "moderate" as const, productivity: 60 },
  { date: "Jul 10", hour: "12:00 PM", notes: "Longer break than planned", mood: "wasted" as const, productivity: 30 },
];

function PreviewFrame({
  label,
  badge,
  children,
  className,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl bg-card shadow-elevated", className)} aria-hidden>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 lg:px-5">
        <p className="text-sm font-medium">{label}</p>
        {badge ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{badge}</span>
        ) : null}
      </div>
      <div className="p-4 lg:p-5">{children}</div>
    </div>
  );
}

function TaskChip({ title, category, time }: { title: string; category: string; time?: string }) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
  return (
    <div
      className="truncate rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs"
      style={{
        background: `color-mix(in oklch, ${color} 18%, transparent)`,
        color,
      }}
    >
      {time ? <span className="mr-1 opacity-70">{time}</span> : null}
      {title}
    </div>
  );
}

/** Hero — hourly tracker timeline */
export function TrackerPreview() {
  return (
    <PreviewFrame label="Today's tracker" badge="Hourly reflection">
      <div className="space-y-3">
        {SAMPLE_HOURS.map((row, i) => {
          const mood = MOOD_CONFIG[row.mood];
          const isCurrent = i === 2;
          return (
            <div key={row.hour} className="flex gap-3">
              <div className="w-14 shrink-0 pt-1 text-xs text-muted-foreground">{row.label}</div>
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-2xl border border-border/60 bg-background p-3",
                  isCurrent && "ring-2 ring-primary/30",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: mood.muted, color: mood.foreground }}
                  >
                    {mood.label}
                  </span>
                  {row.task ? (
                    <span className="truncate rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {row.task}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-foreground/90">{row.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </PreviewFrame>
  );
}

/** Monthly planner — calendar grid with task chips */
export function PlannerMonthPreview() {
  return (
    <PreviewFrame label="July 2026" badge="Monthly planner">
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {WEEKDAYS.map((d) => (
            <div key={d} className="p-1.5 text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {MONTH_CELLS.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "min-h-[4.5rem] border-b border-r border-border/50 p-1 sm:min-h-[5.5rem]",
                !cell.inMonth && "bg-muted/20",
              )}
            >
              <span
                className={cn(
                  "inline-grid size-6 place-items-center rounded-full text-xs sm:size-7",
                  cell.today
                    ? "bg-primary font-semibold text-primary-foreground"
                    : !cell.inMonth
                      ? "text-muted-foreground/60"
                      : "text-foreground",
                )}
              >
                {cell.day}
              </span>
              <div className="mt-1 space-y-0.5">
                {cell.tasks.slice(0, 2).map((t) => (
                  <TaskChip key={t.title} {...t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  );
}

/** Daily agenda — tasks for one day */
export function PlannerDayPreview() {
  return (
    <PreviewFrame label="Thursday, Jul 10" badge="Daily tasks">
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border/60">
        {DAY_TASKS.map((task) => {
          const color = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other;
          return (
            <li key={task.title} className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border border-border sm:size-5",
                  task.done && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {task.done ? <Check className="size-3" strokeWidth={3} /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", task.done && "line-through opacity-60")}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
            </li>
          );
        })}
      </ul>
    </PreviewFrame>
  );
}

/** Analytics ledger */
export function AnalyticsPreview() {
  return (
    <PreviewFrame label="Time ledger" badge="Analytics">
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 border-b border-border bg-muted/30 px-3 py-2 text-[10px] font-medium text-muted-foreground sm:text-xs">
          <span>Hour</span>
          <span>Status</span>
          <span>Notes</span>
          <span className="text-right">Score</span>
        </div>
        {ANALYTICS_ROWS.map((row) => {
          const mood = MOOD_CONFIG[row.mood];
          return (
            <div
              key={`${row.hour}-${row.notes}`}
              className="grid grid-cols-[1fr_1fr_1.5fr_auto] items-center gap-2 border-b border-border/50 px-3 py-2.5 last:border-0"
            >
              <span className="text-xs text-foreground">{row.hour}</span>
              <span
                className="w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: mood.muted, color: mood.foreground }}
              >
                {mood.label}
              </span>
              <span className="truncate text-xs text-muted-foreground">{row.notes}</span>
              <span className="text-right text-xs font-medium">{row.productivity}%</span>
            </div>
          );
        })}
      </div>
    </PreviewFrame>
  );
}

/** Mini app shell — complete dashboard feel */
export function DashboardPreview() {
  const tabs = ["Planner", "Tracker", "Analytics"] as const;
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-elevated" aria-hidden>
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 lg:px-5">
        <span className="text-sm font-semibold">DayMirror</span>
        <nav className="flex rounded-full bg-secondary p-0.5 text-xs">
          {tabs.map((tab) => (
            <span
              key={tab}
              className={cn(
                "rounded-full px-2.5 py-1 sm:px-3",
                tab === "Tracker" ? "bg-card shadow-elevated text-foreground" : "text-muted-foreground",
              )}
            >
              {tab}
            </span>
          ))}
        </nav>
      </div>
      <div className="space-y-4 p-4 lg:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Today&apos;s plan</p>
            <ul className="divide-y divide-border rounded-2xl border border-border/60">
              {DAY_TASKS.slice(0, 2).map((task) => (
                <li key={task.title} className="flex items-center gap-2 px-3 py-2 text-xs">
                  <span className="size-3 rounded border border-border" />
                  <span className="truncate">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Hourly reflection</p>
            <div className="rounded-2xl border border-border/60 bg-background p-3">
              {SAMPLE_HOURS.slice(0, 2).map((row) => {
                const mood = MOOD_CONFIG[row.mood];
                return (
                  <div key={row.hour} className="flex gap-2 py-1.5">
                    <span className="w-12 shrink-0 text-[10px] text-muted-foreground">{row.label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: mood.muted, color: mood.foreground }}
                    >
                      {mood.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use TrackerPreview */
export const ProductPreview = TrackerPreview;
