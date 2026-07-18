"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetTaskProgress } from "@/hooks/use-tasks";
import type { TaskOccurrence } from "@/lib/recurrence";
import { cn } from "@/lib/utils";
import type { TaskDto } from "@/types/api";

type ProgressValue = {
  key: string;
  amount: number;
};

type TaskProgressControlsProps = {
  task: TaskOccurrence<TaskDto>;
  compact?: boolean;
  amountOverride?: number;
  onProgressChange?: (amount: number, completed: boolean) => void;
};

export function TaskProgressControls({
  task,
  compact = false,
  amountOverride,
  onProgressChange,
}: TaskProgressControlsProps) {
  const setProgress = useSetTaskProgress();
  const [custom, setCustom] = useState("");
  const [localProgress, setLocalProgress] = useState<ProgressValue | null>(null);

  const key = `${task.id}:${task.occurrenceDate}`;
  const target = task.targetValue ?? 0;
  const step = task.stepValue > 0 ? task.stepValue : 1;
  const unit = task.unit ?? "";
  const amount =
    amountOverride ??
    (localProgress?.key === key ? localProgress.amount : task.occurrenceAmount ?? 0);
  const pct = target > 0 ? Math.min(100, Math.round((amount / target) * 100)) : 0;
  const remaining = Math.max(0, target - amount);

  async function apply(payload: {
    delta?: number;
    amount?: number;
    completeAll?: boolean;
  }) {
    try {
      const result = await setProgress.mutateAsync({
        taskId: task.id,
        occurrenceDate: task.occurrenceDate,
        ...payload,
      });
      const nextAmount = result.progress.amount;
      setLocalProgress({ key, amount: nextAmount });
      onProgressChange?.(nextAmount, result.completed);
      if (result.completed && amount < target) toast.success("Goal complete");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update progress");
      return false;
    }
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <p className="text-sm text-muted-foreground">
        {remaining === 0 ? "Done for today" : `${remaining} ${unit} left`}
      </p>

      <div className={cn("flex flex-col items-center gap-4", compact ? "py-2" : "py-4")}>
        <div
          className={cn(
            "relative flex items-center justify-center",
            compact ? "size-28" : "size-36",
          )}
        >
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/40"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(
                "text-primary transition-[stroke-dashoffset]",
                amount >= target && "text-emerald-500",
              )}
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            />
          </svg>
          <div className="text-center">
            <div className={cn("font-semibold tabular-nums", compact ? "text-2xl" : "text-3xl")}>
              {amount}
            </div>
            <div className="text-sm text-muted-foreground">
              / {target} {unit}
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full bg-primary transition-all",
              amount >= target && "bg-emerald-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn("rounded-2xl", compact ? "h-10" : "h-12")}
          disabled={setProgress.isPending || amount <= 0}
          onClick={() => void apply({ delta: -step })}
        >
          −{step}
        </Button>
        <Button
          type="button"
          className={cn("rounded-2xl", compact ? "h-10" : "h-12")}
          disabled={setProgress.isPending || amount >= target}
          onClick={() => void apply({ delta: step })}
        >
          +{step}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={cn("rounded-2xl", compact ? "h-10" : "h-12")}
          disabled={setProgress.isPending || amount >= target}
          onClick={() => void apply({ completeAll: true })}
        >
          Complete
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          max={10000}
          placeholder={`Add custom ${unit}`}
          className="h-11 rounded-xl"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-xl"
          disabled={setProgress.isPending || !custom}
          onClick={() => {
            const value = Number(custom);
            if (!Number.isFinite(value) || value <= 0) return;
            void apply({ delta: Math.trunc(value) }).then((updated) => {
              if (updated) setCustom("");
            });
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
