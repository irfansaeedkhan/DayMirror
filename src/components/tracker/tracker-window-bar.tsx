"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatHourLabel } from "@/lib/hour-utils";
import { HOURS_IN_DAY } from "@/lib/constants";
import {
  useClearDayWindow,
  useUpdateTrackerSettings,
  useUpsertDayWindow,
} from "@/hooks/use-tracker";

type TrackerWindowBarProps = {
  date: string;
  startHour: number;
  endHour: number;
  defaultStartHour: number;
  defaultEndHour: number;
  hasDayOverride: boolean;
  footer?: ReactNode;
};

export function TrackerWindowBar({
  date,
  startHour,
  endHour,
  defaultStartHour,
  defaultEndHour,
  hasDayOverride,
  footer,
}: TrackerWindowBarProps) {
  const upsertDay = useUpsertDayWindow();
  const clearDay = useClearDayWindow();
  const saveDefaults = useUpdateTrackerSettings();

  const busy = upsertDay.isPending || clearDay.isPending || saveDefaults.isPending;

  async function applyWindow(nextStart: number, nextEnd: number) {
    if (nextStart > nextEnd) {
      toast.error("Start hour must be before end hour");
      return;
    }
    try {
      await upsertDay.mutateAsync({ date, startHour: nextStart, endHour: nextEnd });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update hours");
    }
  }

  async function handleSaveAsDefault() {
    try {
      await saveDefaults.mutateAsync({ defaultStartHour: startHour, defaultEndHour: endHour });
      toast.success("Saved as your usual hours");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save defaults");
    }
  }

  async function handleResetToDefaults() {
    try {
      await clearDay.mutateAsync(date);
      toast.success("Using your usual hours for this day");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated lg:p-3.5">
      <span className="text-xs font-medium text-muted-foreground">Show hours</span>
      <div className="flex items-center gap-1.5">
        <Select
          value={String(startHour)}
          onValueChange={(v) => applyWindow(Number(v), endHour)}
          disabled={busy}
        >
          <SelectTrigger className="h-8 w-[96px] text-xs" aria-label="From hour">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS_IN_DAY.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {formatHourLabel(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">–</span>
        <Select
          value={String(endHour)}
          onValueChange={(v) => applyWindow(startHour, Number(v))}
          disabled={busy}
        >
          <SelectTrigger className="h-8 w-[96px] text-xs" aria-label="To hour">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS_IN_DAY.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {formatHourLabel(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5 sm:ml-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={busy}
          onClick={handleSaveAsDefault}
        >
          Save usual
        </Button>
        {hasDayOverride && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            disabled={busy}
            onClick={handleResetToDefaults}
          >
            Reset
          </Button>
        )}
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border/40 pt-2">
        <span className="text-[11px] text-muted-foreground">
          Usual: {formatHourLabel(defaultStartHour)}–{formatHourLabel(defaultEndHour)}
        </span>
        {footer}
      </div>
    </div>
  );
}
