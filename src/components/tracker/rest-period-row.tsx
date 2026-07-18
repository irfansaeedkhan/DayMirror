"use client";

import { Coffee } from "lucide-react";
import { formatHourLabel } from "@/lib/hour-utils";

type RestPeriodRowProps = {
  startHour: number;
  endHour: number;
};

export function RestPeriodRow({ startHour, endHour }: RestPeriodRowProps) {
  const label =
    startHour === endHour
      ? formatHourLabel(startHour)
      : `${formatHourLabel(startHour)} – ${formatHourLabel(endHour)}`;

  return (
    <div className="flex items-center py-1">
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] text-muted-foreground/80">
        <Coffee className="size-3 shrink-0 opacity-60" />
        <span>Rest</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="tabular-nums">{label}</span>
      </div>
    </div>
  );
}
