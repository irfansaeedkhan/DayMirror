"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskModal } from "@/components/tasks/task-modal";
import { format } from "date-fns";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <>
      <AppShell
        onNewTask={() => {
          setDefaultDate(format(new Date(), "yyyy-MM-dd"));
          setTaskModalOpen(true);
        }}
      >
        {children}
      </AppShell>
      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} defaultDate={defaultDate} />
    </>
  );
}
