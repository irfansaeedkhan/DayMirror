"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskProgressControls } from "@/components/tasks/task-progress-controls";
import type { TaskOccurrence } from "@/lib/recurrence";
import type { TaskDto } from "@/types/api";

type TaskProgressSheetProps = {
  task: TaskOccurrence<TaskDto> | null;
  onClose: () => void;
};

export function TaskProgressSheet({ task, onClose }: TaskProgressSheetProps) {
  return (
    <Sheet open={!!task} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="mx-auto w-full max-w-lg rounded-t-3xl px-0 pb-6">
        {task ? (
          <>
            <SheetHeader className="px-6 pt-2 text-left">
              <SheetTitle className="text-xl">{task.title}</SheetTitle>
            </SheetHeader>

            <div className="px-6 pt-2">
              <TaskProgressControls task={task} />
            </div>

            <SheetFooter className="mt-4 px-6 sm:justify-center">
              <Button type="button" variant="ghost" className="rounded-full" onClick={onClose}>
                Close
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
