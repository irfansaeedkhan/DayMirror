"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronsUp, Link2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAttachTaskToHour, useUpsertHourLog } from "@/hooks/use-tracker";
import { MOOD_CONFIG } from "@/lib/constants";
import { MODERATE_XP_DEFAULT, resolveHourXp, xpForMoodSelection } from "@/lib/hour-xp";
import { cn } from "@/lib/utils";
import type { HourLogDto, HourMood, TaskDto } from "@/types/api";
import { toast } from "sonner";

const MOODS = Object.entries(MOOD_CONFIG).map(([value, cfg]) => ({ value: value as HourMood, ...cfg }));

function formatHour(h: number) {
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

function collapsedSummary(description: string | null | undefined, moodLabel: string | null) {
  const trimmed = description?.trim();
  if (trimmed) return { text: trimmed, muted: false };
  if (moodLabel) return { text: `Logged as ${moodLabel}`, muted: false };
  return { text: "Tap to log this hour…", muted: true };
}

function HourStatusDot({
  hasLog,
  isCurrent,
}: {
  hasLog: boolean;
  isCurrent: boolean;
}) {
  return (
    <span
      className={cn(
        "block size-2.5 shrink-0 rounded-full ring-4",
        isCurrent
          ? "bg-primary ring-primary/15"
          : hasLog
            ? "bg-muted-foreground/45 ring-background"
            : "bg-border ring-background",
      )}
    />
  );
}

type HourRowProps = {
  hour: number;
  date: string;
  log?: HourLogDto;
  tasks: TaskDto[];
  isCurrent: boolean;
  expanded: boolean;
  onToggle: () => void;
  onOpenDrawer: () => void;
  suggestion: TaskDto | null;
};

export function HourRow({
  hour,
  date,
  log,
  tasks,
  isCurrent,
  expanded,
  onToggle,
  onOpenDrawer,
  suggestion,
}: HourRowProps) {
  const upsert = useUpsertHourLog();
  const attach = useAttachTaskToHour();
  const [desc, setDesc] = useState(log?.description ?? "");
  const [mood, setMood] = useState<HourMood | null>(log?.mood ?? null);
  const [productivity, setProductivity] = useState(log?.productivity ?? 50);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDesc(log?.description ?? "");
    setMood(log?.mood ?? null);
    setProductivity(log?.productivity ?? 50);
  }, [log?.id, log?.description, log?.mood, log?.productivity]);

  useEffect(() => {
    if (!expanded) return;
    const id = window.setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }, 0);
    return () => window.clearTimeout(id);
  }, [expanded, log?.description]);

  const persist = useCallback(
    async (next: { description?: string | null; mood?: HourMood | null; productivity?: number }) => {
      try {
        return await upsert.mutateAsync({
          id: log?.id,
          date,
          hour,
          description: next.description !== undefined ? next.description : desc || null,
          mood: next.mood !== undefined ? next.mood : mood,
          productivity: next.productivity ?? productivity,
        });
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [log?.id, date, hour, desc, mood, productivity, upsert],
  );

  const persistRef = useRef(persist);
  persistRef.current = persist;

  const queueSave = (next: Parameters<typeof persist>[0]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistRef.current(next), 500);
  };

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const attachedTasks = tasks.filter((t) => (log?.linkedTaskIds ?? []).includes(t.id));
  const effectiveMood = mood ?? log?.mood ?? null;
  const moodInfo = effectiveMood ? MOOD_CONFIG[effectiveMood] : null;
  const hourXp = resolveHourXp(effectiveMood, productivity);
  const summary = collapsedSummary(log?.description, moodInfo?.label ?? null);

  const linkSuggestion = async () => {
    if (!suggestion) return;
    let logId = log?.id;
    if (!logId) {
      const created = await persist({});
      logId = created?.id;
    }
    if (logId) {
      try {
        await attach.mutateAsync({ hourLogId: logId, taskId: suggestion.id, attach: true });
        toast.success(`Linked "${suggestion.title}"`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
  };

  return (
    <div
      className={cn("min-w-0 w-full", moodInfo && "hour-card-wrap")}
      style={
        moodInfo
          ? ({ "--hour-mood-color": moodInfo.color } as CSSProperties)
          : undefined
      }
    >
      <Collapsible
        open={expanded}
        onOpenChange={(open) => {
          if (open !== expanded) onToggle();
        }}
      >
        <div
          className={cn(
            "hour-card-surface rounded-2xl bg-card shadow-elevated transition-colors",
            expanded ? "px-3 pt-3 pb-4 sm:px-4 sm:pt-4 sm:pb-5" : "px-3 py-2.5 sm:px-4 sm:py-3",
            isCurrent && !moodInfo && "ring-1 ring-primary/30",
          )}
        >
          {!expanded ? (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col gap-2 text-left hover:opacity-90"
              >
                <div className="flex items-center gap-2">
                  <HourStatusDot hasLog={!!log} isCurrent={isCurrent} />
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      isCurrent ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {formatHour(hour)}
                  </span>
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    {hourXp !== null && (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {hourXp} XP
                      </span>
                    )}
                    {attachedTasks.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
                        <Link2 className="size-3" />
                        {attachedTasks.length}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "min-w-0 truncate text-sm",
                    summary.muted ? "text-muted-foreground/70" : "text-foreground",
                  )}
                >
                  {summary.text}
                </span>
                {moodInfo && (
                  <span
                    className="mood-pill w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:px-3 sm:text-[11px]"
                    style={{
                      background: moodInfo.muted,
                      color: moodInfo.foreground,
                    }}
                  >
                    {moodInfo.label}
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
          ) : (
            <CollapsibleContent forceMount className="data-[state=closed]:hidden">
              <>
                <div className="mb-2 flex items-center gap-2">
                  <HourStatusDot hasLog={!!log} isCurrent={isCurrent} />
                  {isCurrent ? (
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {formatHour(hour)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                        Now
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {formatHour(hour)}
                    </span>
                  )}
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    {hourXp !== null && effectiveMood !== "moderate" && (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {hourXp} XP
                      </span>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0"
                        aria-label="Collapse hour"
                      >
                        <ChevronsUp />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

            <Textarea
              ref={textareaRef}
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                queueSave({ description: e.target.value || null });
              }}
              placeholder="What are you doing?"
              rows={3}
              className="min-h-[4.5rem resize-none whitespace-normal wrap-break-word border-0 px-0 text-sm font-normal shadow-none focus-visible:ring-0"
            />

            {suggestion && (
              <button
                type="button"
                onClick={linkSuggestion}
                className="mt-1 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition w-full sm:w-auto"
              >
                <Sparkles className="size-3.5" />
                <span>
                  Working on <span className="font-semibold">{suggestion.title}</span>?
                </span>
                <span className="ml-auto sm:ml-2 font-semibold">Link →</span>
              </button>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {MOODS.map((m) => {
                const active = mood === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      const next = active ? null : m.value;
                      setMood(next);
                      if (next === null) {
                        persist({ mood: null });
                        return;
                      }
                      const nextXp = next === "moderate" ? MODERATE_XP_DEFAULT : xpForMoodSelection(next);
                      setProductivity(nextXp);
                      persist({ mood: next, productivity: nextXp });
                    }}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium transition sm:px-3.5 sm:text-[11px]",
                      !active && "border-transparent bg-secondary text-secondary-foreground hover:bg-hover",
                    )}
                    style={
                      active
                        ? {
                            background: m.muted,
                            color: m.foreground,
                            borderColor: `color-mix(in oklch, ${m.color} 35%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {effectiveMood === "moderate" && (
              <div className="mt-3 flex items-center gap-2 sm:gap-3">
                <span className="w-14 shrink-0 text-[10px] text-muted-foreground sm:w-16 sm:text-[11px]">On track</span>
                <Slider
                  value={[productivity]}
                  onValueChange={(v) => {
                    setProductivity(v[0]);
                    queueSave({ productivity: v[0] });
                  }}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:w-14">
                  {productivity} XP
                </span>
              </div>
            )}

            <div className="-mx-3 mt-3 border-t border-border/50 px-3 pt-3 sm:-mx-4 sm:px-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-medium text-foreground shadow-elevated transition-colors hover:bg-hover sm:px-3 sm:text-[11px]"
                >
                  <Link2 className="size-3.5 shrink-0" strokeWidth={2} />
                  Attach task
                </button>
                {attachedTasks.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px]"
                    style={{
                      background: `color-mix(in oklch, var(--primary) 12%, transparent)`,
                    }}
                  >
                    {t.title}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!log?.id) return;
                        try {
                          await attach.mutateAsync({ hourLogId: log.id, taskId: t.id, attach: false });
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
                </>
              </CollapsibleContent>
            )}
          </div>
        </Collapsible>
      </div>
  );
}
