import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { tasksApi } from "@/lib/api";
import type { CreateTaskPayload, UpdateTaskPayload } from "@/types/api";

export function useTasksInRange(start: Date, end: Date) {
  return useQuery({
    queryKey: ["tasks", format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd")],
    queryFn: () =>
      tasksApi.listInRange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd")),
  });
}

export function useUpsertTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload & { id?: string }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return tasksApi.update({ id, ...rest });
      }
      return tasksApi.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      date,
      completed,
    }: {
      taskId: string;
      date: string;
      completed: boolean;
    }) => tasksApi.toggleCompletion(taskId, date, completed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export type { UpdateTaskPayload };
