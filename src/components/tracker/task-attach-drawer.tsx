"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Link2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAttachTaskToHour, useUpsertHourLog } from "@/hooks/use-tracker";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatHourLabel } from "@/lib/hour-utils";
import { partitionTasksForHour } from "@/lib/task-hour-match";
import { cn } from "@/lib/utils";
import type { HourLogDto, TaskDto } from "@/types/api";
import { toast } from "sonner";

type TaskAttachDrawerProps = {
  open: boolean;
  onClose: () => void;
  hour: number | null;
  date: string;
  tasks: TaskDto[];
  log?: HourLogDto;
};

export function TaskAttachDrawer({ open, onClose, hour, date, tasks, log }: TaskAttachDrawerProps) {
  const upsert = useUpsertHourLog();
  const attach = useAttachTaskToHour();
  const [search, setSearch] = useState("");
  const attachedIds = new Set(log?.linkedTaskIds ?? []);

  const { fitsHour, earlierToday, otherToday } = useMemo(() => {
    if (hour === null) return { fitsHour: tasks, earlierToday: [], otherToday: [] };
    return partitionTasksForHour(tasks, hour, date);
  }, [tasks, hour, date]);

  const filterTasks = (items: TaskDto[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  };

  const handlePick = async (task: TaskDto) => {
    if (hour === null) return;
    try {
      let logId = log?.id;
      if (!logId) {
        const created = await upsert.mutateAsync({ date, hour, description: null });
        logId = created.id;
      }
      const isAttached = attachedIds.has(task.id);
      await attach.mutateAsync({ hourLogId: logId, taskId: task.id, attach: !isAttached });
      toast.success(isAttached ? `Unlinked "${task.title}"` : `Linked "${task.title}"`);
      if (!isAttached) onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const filteredEarlier = filterTasks(earlierToday);
  const filteredFits = filterTasks(fitsHour);
  const filteredOther = filterTasks(otherToday);
  const hasVisible =
    filteredEarlier.length + filteredFits.length + filteredOther.length > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            Attach task to this hour
          </SheetTitle>
          {hour !== null && (
            <p className="text-sm text-muted-foreground">{formatHourLabel(hour)}</p>
          )}
        </SheetHeader>

        <Command
          className="flex-1 overflow-hidden bg-transparent [&_[cmdk-input-wrapper]]:mx-6 [&_[cmdk-input-wrapper]]:mb-4 [&_[cmdk-input-wrapper]]:flex [&_[cmdk-input-wrapper]]:h-11 [&_[cmdk-input-wrapper]]:items-center [&_[cmdk-input-wrapper]]:gap-2.5 [&_[cmdk-input-wrapper]]:rounded-xl [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-border/60 [&_[cmdk-input-wrapper]]:bg-secondary/50 [&_[cmdk-input-wrapper]]:px-3.5 [&_[cmdk-input-wrapper]]:border-b-0 [&_[cmdk-input-wrapper]_svg]:size-4 [&_[cmdk-input-wrapper]_svg]:shrink-0 [&_[cmdk-input-wrapper]_svg]:opacity-70 [&_[cmdk-input]]:h-11 [&_[cmdk-input]]:py-0 [&_[cmdk-input]]:text-sm"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search tasks..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-none flex-1 px-4 pb-4">
            {tasks.length === 0 && (
              <CommandEmpty>No tasks today. Plan one in the Planner first.</CommandEmpty>
            )}

            {filteredFits.length > 0 && (
              <CommandGroup heading="Scheduled for this hour">
                {filteredFits.map((t) => (
                  <TaskCommandItem
                    key={t.id}
                    task={t}
                    isAttached={attachedIds.has(t.id)}
                    onPick={handlePick}
                    disabled={attach.isPending}
                  />
                ))}
              </CommandGroup>
            )}

            {filteredEarlier.length > 0 && (
              <CommandGroup heading="Earlier today — catch up now">
                {filteredEarlier.map((t) => (
                  <TaskCommandItem
                    key={t.id}
                    task={t}
                    isAttached={attachedIds.has(t.id)}
                    onPick={handlePick}
                    disabled={attach.isPending}
                    badge="Missed slot"
                  />
                ))}
              </CommandGroup>
            )}

            {filteredOther.length > 0 && (
              <CommandGroup heading="Other tasks today">
                {filteredOther.map((t) => (
                  <TaskCommandItem
                    key={t.id}
                    task={t}
                    isAttached={attachedIds.has(t.id)}
                    onPick={handlePick}
                    disabled={attach.isPending}
                  />
                ))}
              </CommandGroup>
            )}

            {tasks.length > 0 && !hasVisible && (
              <CommandEmpty>No tasks match your search.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  );
}

function TaskCommandItem({
  task,
  isAttached,
  onPick,
  disabled,
  badge,
}: {
  task: TaskDto;
  isAttached: boolean;
  onPick: (t: TaskDto) => void;
  disabled: boolean;
  badge?: string;
}) {
  return (
    <CommandItem
      value={task.id}
      onSelect={() => onPick(task)}
      disabled={disabled}
      className={cn("rounded-xl my-0.5", isAttached && "bg-primary/8")}
    >
      <span
        className="size-2.5 rounded-full shrink-0"
        style={{ background: CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{task.title}</div>
        {task.startAt && (
          <div className="text-[11px] text-muted-foreground">
            {format(new Date(task.startAt), "h:mm a")}
            {task.endAt ? ` – ${format(new Date(task.endAt), "h:mm a")}` : ""}
          </div>
        )}
      </div>
      {badge && !isAttached && (
        <span className="text-[10px] text-muted-foreground shrink-0">{badge}</span>
      )}
      {isAttached && <Check className="size-4 text-primary shrink-0" />}
    </CommandItem>
  );
}
