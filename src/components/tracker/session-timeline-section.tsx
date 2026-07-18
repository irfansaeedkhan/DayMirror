"use client";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatHourLabel } from "@/lib/hour-utils";
import { cn } from "@/lib/utils";

type SessionTimelineSectionProps = {
  name: string;
  startHour: number;
  endHour: number;
  isActive?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
};

export function SessionTimelineSection({
  name,
  startHour,
  endHour,
  isActive,
  expanded = true,
  onToggle,
  children,
}: SessionTimelineSectionProps) {
  const range =
    startHour === endHour
      ? formatHourLabel(startHour)
      : `${formatHourLabel(startHour)} – ${formatHourLabel(endHour)}`;

  return (
    <Collapsible
      open={expanded}
      onOpenChange={(open) => {
        if (open !== expanded) onToggle?.();
      }}
    >
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-px flex-1 bg-border/40" />
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group flex max-w-full shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-hover sm:max-w-[min(100%,280px)] sm:gap-1.5",
                  isActive ? "text-primary" : "text-foreground",
                )}
                title={`${name} · ${range}`}
              >
                <span className="truncate text-xs font-semibold sm:text-sm">{name}</span>
                <span className="shrink-0 text-[11px] font-normal tabular-nums text-muted-foreground sm:text-sm">
                  {range}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <div className="h-px flex-1 bg-border/40" />
          </div>
        </div>
        <CollapsibleContent>
          <div className="space-y-3 sm:space-y-4">{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
