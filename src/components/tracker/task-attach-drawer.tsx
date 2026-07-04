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
import { cn } from "@/lib/utils";
import type { HourLogDto, TaskDto } from "@/types/api";
import { toast } from "sonner";

function formatHour(h: number) {
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

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

  const { recommended, remaining } = useMemo(() => {
    if (hour === null) return { recommended: [], remaining: tasks };
    const slotStart = new Date(`${date}T00:00:00`);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1);

    const rec: TaskDto[] = [];
    const rest: TaskDto[] = [];

    for (const t of tasks) {
      if (!t.startAt) {
        rest.push(t);
        continue;
      }
      const start = new Date(t.startAt);
      const end = t.endAt ? new Date(t.endAt) : new Date(start.getTime() + 3600000);
      if (start < slotEnd && end > slotStart) rec.push(t);
      else rest.push(t);
    }

    return { recommended: rec, remaining: rest };
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

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            Attach task to time block
          </SheetTitle>
          {hour !== null && <p className="text-sm text-muted-foreground">{formatHour(hour)}</p>}
        </SheetHeader>

        <Command className="flex-1 border-t mt-4" shouldFilter={false}>
          <CommandInput
            placeholder="Search tasks..."
            value={search}
            onValueChange={setSearch}
            className="h-11"
          />
          <CommandList className="max-h-none flex-1 px-2 pb-4">
            {tasks.length === 0 && (
              <CommandEmpty>No tasks today. Plan one in the Planner first.</CommandEmpty>
            )}

            {filterTasks(recommended).length > 0 && (
              <CommandGroup heading="Recommended for this window">
                {filterTasks(recommended).map((t) => (
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

            {filterTasks(remaining).length > 0 && (
              <CommandGroup heading="Remaining agenda">
                {filterTasks(remaining).map((t) => (
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

            {tasks.length > 0 && filterTasks(recommended).length === 0 && filterTasks(remaining).length === 0 && (
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
}: {
  task: TaskDto;
  isAttached: boolean;
  onPick: (t: TaskDto) => void;
  disabled: boolean;
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
          <div className="text-[11px] text-muted-foreground">{format(new Date(task.startAt), "h:mm a")}</div>
        )}
      </div>
      {isAttached && <Check className="size-4 text-primary shrink-0" />}
    </CommandItem>
  );
}
