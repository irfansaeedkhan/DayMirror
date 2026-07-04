"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAttachTaskToHour, useUpsertHourLog } from "@/hooks/use-tracker";
import { MOOD_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { HourLogDto, HourMood, TaskDto } from "@/types/api";
import { toast } from "sonner";

const MOODS = Object.entries(MOOD_CONFIG).map(([value, cfg]) => ({ value: value as HourMood, ...cfg }));

function formatHour(h: number) {
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
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

  useEffect(() => {
    setDesc(log?.description ?? "");
    setMood(log?.mood ?? null);
    setProductivity(log?.productivity ?? 50);
  }, [log?.id, log?.description, log?.mood, log?.productivity]);

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

  const queueSave = (next: Parameters<typeof persist>[0]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(next), 500);
  };

  const attachedTasks = tasks.filter((t) => (log?.linkedTaskIds ?? []).includes(t.id));
  const moodInfo = mood ? MOOD_CONFIG[mood] : null;

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
    <div className="flex items-start gap-3">
      <div className="w-[60px] pt-3 text-right">
        <div className={cn("text-xs tabular-nums font-medium", isCurrent ? "text-primary" : "text-muted-foreground")}>
          {formatHour(hour)}
        </div>
      </div>
      <div className="relative pt-3.5">
        <span
          className={cn(
            "block size-2.5 rounded-full ring-4",
            isCurrent ? "bg-primary ring-primary/15" : log ? "ring-background" : "bg-border ring-background",
          )}
          style={log && !isCurrent ? { background: moodInfo?.color } : undefined}
        />
      </div>

      <div
        className={cn(
          "flex-1 rounded-2xl bg-card shadow-elevated transition-all",
          expanded ? "p-4" : "px-4 py-2.5 cursor-pointer hover:bg-accent/40",
          isCurrent && "ring-1 ring-primary/30",
        )}
        onClick={!expanded ? onToggle : undefined}
        onKeyDown={!expanded ? (e) => e.key === "Enter" && onToggle() : undefined}
        role={!expanded ? "button" : undefined}
        tabIndex={!expanded ? 0 : undefined}
      >
        {!expanded ? (
          <div className="flex items-center gap-3 min-h-[28px]">
            {log?.description ? (
              <span className="text-sm truncate flex-1">{log.description}</span>
            ) : (
              <span className="text-sm text-muted-foreground/70 flex-1">Tap to log this hour…</span>
            )}
            {moodInfo && (
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0"
                style={{ background: moodInfo.bg, color: moodInfo.color }}
              >
                {moodInfo.label}
              </span>
            )}
            {attachedTasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <Link2 className="size-3" />
                {attachedTasks.length}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs uppercase tracking-wider font-semibold", isCurrent ? "text-primary" : "text-muted-foreground")}>
                {isCurrent ? "Now" : formatHour(hour)}
              </span>
              <button type="button" onClick={onToggle} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                Collapse
              </button>
            </div>

            <Textarea
              autoFocus={isCurrent}
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                queueSave({ description: e.target.value || null });
              }}
              placeholder="What are you doing?"
              rows={2}
              className="resize-none border-0 shadow-none px-0 focus-visible:ring-0 text-base"
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

            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {MOODS.map((m) => {
                const active = mood === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      const next = active ? null : m.value;
                      setMood(next);
                      persist({ mood: next });
                    }}
                    className={cn(
                      "text-[11px] font-medium px-3 py-1 rounded-full transition",
                      active ? "" : "bg-secondary text-secondary-foreground hover:bg-accent",
                    )}
                    style={active ? { background: m.color, color: "white" } : undefined}
                  >
                    {m.label}
                  </button>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={onOpenDrawer} className="ml-auto rounded-full text-[11px] h-7 gap-1.5">
                <Link2 className="size-3" /> Attach task
              </Button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-[11px] text-muted-foreground w-20">Productivity</span>
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
              <span className="text-xs tabular-nums w-10 text-right">{productivity}%</span>
            </div>

            {attachedTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1.5">
                {attachedTasks.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
