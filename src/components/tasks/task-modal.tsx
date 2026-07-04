"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useDeleteTask, useUpsertTask } from "@/hooks/use-tasks";
import { CATEGORY_LABELS } from "@/lib/constants";
import { taskFormSchema, type TaskFormValues } from "@/lib/validators/task-form";
import type { TaskDto } from "@/types/api";

const RECURRENCE = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (Mon–Fri)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

type TaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  task?: TaskDto | null;
};

export function TaskModal({ open, onOpenChange, defaultDate, task }: TaskModalProps) {
  const upsert = useUpsertTask();
  const remove = useDeleteTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      date: defaultDate,
      allDay: true,
      start: "09:00",
      end: "10:00",
      category: "work",
      priority: "medium",
      recurrence: "none",
      recurrenceUntil: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (task) {
      form.reset({
        title: task.title,
        notes: task.notes ?? "",
        date: task.date,
        allDay: task.allDay,
        start: task.startAt ? format(new Date(task.startAt), "HH:mm") : "09:00",
        end: task.endAt ? format(new Date(task.endAt), "HH:mm") : "10:00",
        category: task.category,
        priority: task.priority,
        recurrence: task.recurrence,
        recurrenceUntil: task.recurrenceUntil ?? "",
      });
    } else {
      form.reset({
        title: "",
        notes: "",
        date: defaultDate,
        allDay: true,
        start: "09:00",
        end: "10:00",
        category: "work",
        priority: "medium",
        recurrence: "none",
        recurrenceUntil: "",
      });
    }
  }, [open, task, defaultDate, form]);

  const allDay = form.watch("allDay");
  const priority = form.watch("priority");
  const recurrence = form.watch("recurrence");
  const date = form.watch("date");

  async function onSubmit(values: TaskFormValues) {
    const startAt = !values.allDay && values.start
      ? parse(`${values.date} ${values.start}`, "yyyy-MM-dd HH:mm", new Date()).toISOString()
      : null;
    const endAt = !values.allDay && values.end
      ? parse(`${values.date} ${values.end}`, "yyyy-MM-dd HH:mm", new Date()).toISOString()
      : null;

    try {
      await upsert.mutateAsync({
        id: task?.id,
        title: values.title.trim(),
        notes: values.notes?.trim() || null,
        date: values.date,
        allDay: values.allDay,
        startAt,
        endAt,
        category: values.category,
        priority: values.priority,
        recurrence: values.recurrence,
        recurrenceUntil: values.recurrence !== "none" && values.recurrenceUntil ? values.recurrenceUntil : null,
      });
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl tracking-tight lg:text-2xl">
            {task ? "Edit task" : "What needs to be done?"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 pb-2 pt-4">
          <Input
            placeholder="e.g. Draft Q3 product roadmap"
            className="h-11 rounded-xl text-base lg:h-12 lg:text-lg"
            autoFocus
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          )}

          <Textarea
            placeholder="Notes (optional)"
            className="rounded-xl resize-none"
            rows={2}
            {...form.register("notes")}
          />

          <div className="rounded-2xl border border-border bg-card/50 divide-y divide-border">
            <ModalRow label="Date">
              <DatePicker value={date} onChange={(v) => form.setValue("date", v)} className="w-auto" />
            </ModalRow>
            <ModalRow label="All day">
              <Switch checked={allDay} onCheckedChange={(v) => form.setValue("allDay", v)} />
            </ModalRow>
            {!allDay && (
              <>
                <ModalRow label="Starts">
                  <TimePicker value={form.watch("start")} onChange={(v) => form.setValue("start", v)} />
                </ModalRow>
                <ModalRow label="Ends">
                  <TimePicker value={form.watch("end")} onChange={(v) => form.setValue("end", v)} />
                </ModalRow>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card/50 divide-y divide-border">
            <ModalRow label="Category">
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger className="h-10 w-[10rem] cursor-pointer rounded-lg lg:h-11 lg:w-[12rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ModalRow>

            <ModalRow label="Priority">
              <ToggleGroup
                type="single"
                value={priority}
                onValueChange={(v) => v && form.setValue("priority", v as TaskFormValues["priority"])}
                className="gap-1"
              >
                {(["low", "medium", "high"] as const).map((p) => (
                  <ToggleGroupItem key={p} value={p} className="h-9 cursor-pointer rounded-full px-4 text-sm capitalize lg:h-10 lg:text-base">
                    {p}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </ModalRow>

            <ModalRow label="Repeat">
              <Select
                value={recurrence}
                onValueChange={(v) => form.setValue("recurrence", v as TaskFormValues["recurrence"])}
              >
                <SelectTrigger className="h-10 w-[12rem] cursor-pointer rounded-lg lg:h-11 lg:w-[14rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ModalRow>

            {recurrence !== "none" && (
              <ModalRow label="Until">
                <DatePicker
                  value={form.watch("recurrenceUntil") || undefined}
                  onChange={(v) => form.setValue("recurrenceUntil", v)}
                  placeholder="No end date"
                  className="w-auto"
                />
              </ModalRow>
            )}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-card/30 flex-row gap-2 sm:justify-between">
          {task ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive rounded-full"
              onClick={async () => {
                try {
                  await remove.mutateAsync(task.id);
                  toast.success("Task deleted");
                  onOpenChange(false);
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={upsert.isPending} className="rounded-full">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 lg:py-3.5">
      <span className="text-sm text-muted-foreground lg:text-base">{label}</span>
      {children}
    </div>
  );
}
