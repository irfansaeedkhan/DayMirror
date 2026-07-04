"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDays,
  addMonths,
  format,
  subMonths,
} from "date-fns";
import { parseDateOnly } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthGrid } from "@/components/planner/month-grid";
import { DayAgenda } from "@/components/planner/day-agenda";
import { TaskModal } from "@/components/tasks/task-modal";
import { TaskDetailDrawer } from "@/components/planner/task-detail-drawer";
import { cn } from "@/lib/utils";
import type { TaskDto } from "@/types/api";
import type { TaskOccurrence } from "@/lib/recurrence";

type View = "month" | "day";

export function PlannerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as View) || "month";
  const dateParam = searchParams.get("date");
  const current = dateParam ? parseDateOnly(dateParam) : new Date();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [drawerTask, setDrawerTask] = useState<TaskDto | TaskOccurrence<TaskDto> | null>(null);
  const [modalDate, setModalDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const setParams = (next: { view?: View; date?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.view) params.set("view", next.view);
    if (next.date) params.set("date", next.date);
    router.push(`/planner?${params.toString()}`);
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl xl:text-4xl">
          {view === "month" ? format(current, "MMMM yyyy") : format(current, "EEEE, MMM d")}
        </h1>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setParams({
                date: format(view === "month" ? subMonths(current, 1) : addDays(current, -1), "yyyy-MM-dd"),
              })
            }
            className="rounded-full"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4 lg:size-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setParams({ date: format(new Date(), "yyyy-MM-dd") })} className="rounded-full lg:text-base">
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setParams({
                date: format(view === "month" ? addMonths(current, 1) : addDays(current, 1), "yyyy-MM-dd"),
              })
            }
            className="rounded-full"
            aria-label="Next"
          >
            <ChevronRight className="size-4 lg:size-5" />
          </Button>
        </div>
        <div className="ml-auto flex items-center rounded-full bg-secondary p-1 text-sm lg:text-base">
          {(["month", "day"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setParams({ view: v, date: format(current, "yyyy-MM-dd") })}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 capitalize transition lg:px-4 lg:py-2",
                view === v ? "bg-card shadow-elevated" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <MonthGrid
          date={current}
          onDayClick={(d) => setParams({ view: "day", date: format(d, "yyyy-MM-dd") })}
          onTaskClick={(t) => setDrawerTask(t)}
        />
      ) : (
        <DayAgenda
          date={current}
          onTaskClick={(t) => setDrawerTask(t)}
        />
      )}

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        defaultDate={modalDate}
        task={editingTask}
      />
      <TaskDetailDrawer
        task={drawerTask}
        onClose={() => setDrawerTask(null)}
        onEdit={(t) => {
          setEditingTask(t as TaskDto);
          setModalDate(t.date);
          setTaskModalOpen(true);
          setDrawerTask(null);
        }}
      />
    </div>
  );
}
