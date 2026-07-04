"use client";

import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToggleCompletion } from "@/hooks/use-tasks";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { parseDateOnly } from "@/lib/date-utils";
import type { TaskOccurrence } from "@/lib/recurrence";
import type { TaskDto } from "@/types/api";
import { cn } from "@/lib/utils";

type TaskDetailDrawerProps = {
  task: TaskDto | TaskOccurrence<TaskDto> | null;
  onClose: () => void;
  onEdit: (task: TaskDto) => void;
};

const PRIORITY_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

function formatTimeLabel(iso: string) {
  return format(new Date(iso), "h:mm a");
}

export function TaskDetailDrawer({ task, onClose, onEdit }: TaskDetailDrawerProps) {
  const toggle = useToggleCompletion();
  const completed = task
    ? "occurrenceCompleted" in task
      ? task.occurrenceCompleted
      : !!task.completedAt
    : false;
  const occurrenceDate = task
    ? "occurrenceDate" in task
      ? task.occurrenceDate
      : task.date
    : "";

  return (
    <Sheet open={!!task} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        {task && (
          <>
            <SheetHeader className="space-y-4 border-b border-border/60 px-6 py-6 text-left">
              <div className="flex items-start gap-4 pr-8">
                <Checkbox
                  className="mt-1 size-5"
                  checked={completed}
                  onCheckedChange={(v) =>
                    toggle.mutate({
                      taskId: task.id,
                      date: occurrenceDate,
                      completed: !!v,
                    })
                  }
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <SheetTitle
                    className={cn(
                      "text-left text-xl font-semibold leading-snug lg:text-2xl",
                      completed && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2 text-sm lg:text-base">
                    <Badge variant={PRIORITY_VARIANT[task.priority] ?? "secondary"} className="capitalize rounded-full">
                      {task.priority}
                    </Badge>
                    {task.recurrence !== "none" && (
                      <Badge variant="outline" className="capitalize rounded-full">
                        Repeats {task.recurrence}
                      </Badge>
                    )}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6 py-5">
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:text-sm">
                    Schedule
                  </h3>
                  <p className="text-base lg:text-lg">
                    {format(parseDateOnly(occurrenceDate), "EEEE, MMMM d")}
                    {!task.allDay && task.startAt && (
                      <>
                        {" · "}
                        {formatTimeLabel(task.startAt)}
                        {task.endAt && ` – ${formatTimeLabel(task.endAt)}`}
                      </>
                    )}
                    {task.allDay && <span className="text-muted-foreground"> · All day</span>}
                  </p>
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:text-sm">
                    Category
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full lg:size-3.5"
                      style={{ background: CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other }}
                    />
                    <span className="text-base capitalize lg:text-lg">
                      {CATEGORY_LABELS[task.category] ?? task.category}
                    </span>
                  </div>
                </section>

                {task.notes && (
                  <>
                    <Separator />
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:text-sm">
                        Notes
                      </h3>
                      <p className="text-base leading-relaxed text-foreground/90 lg:text-lg whitespace-pre-wrap">
                        {task.notes}
                      </p>
                    </section>
                  </>
                )}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t border-border/60 px-6 py-4 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                onClick={() => onEdit(task as TaskDto)}
              >
                <Pencil className="size-4" />
                Edit task
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
