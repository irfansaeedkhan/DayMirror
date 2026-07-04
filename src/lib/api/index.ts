import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  AnalyticsRowDto,
  AttachTaskPayload,
  CreateTaskPayload,
  HourLogDto,
  TaskCompletionDto,
  TaskDto,
  UpdateTaskPayload,
  UpsertHourLogPayload,
} from "@/types/api";

export const tasksApi = {
  listInRange(start: string, end: string) {
    return apiGet<{ tasks: TaskDto[]; completions: TaskCompletionDto[] }>("tasks", { start, end });
  },
  getById(id: string) {
    return apiGet<TaskDto>(`tasks/${id}`);
  },
  create(payload: CreateTaskPayload) {
    return apiPost<TaskDto>("tasks", payload);
  },
  update(payload: UpdateTaskPayload) {
    return apiPatch<TaskDto>("tasks", payload);
  },
  remove(id: string) {
    return apiDelete<{ success: boolean }>(`tasks/${id}`);
  },
  toggleCompletion(taskId: string, occurrenceDate: string, completed: boolean) {
    return apiPost<{ success: boolean }>("tasks/completions/toggle", {
      taskId,
      occurrenceDate,
      completed,
    });
  },
};

export const trackerApi = {
  getDay(date: string) {
    return apiGet<{
      logs: HourLogDto[];
      settings: { defaultStartHour: number; defaultEndHour: number };
    }>("tracker", { date });
  },
  upsert(payload: UpsertHourLogPayload) {
    return apiPost<HourLogDto>("tracker", payload);
  },
  attachTask(payload: AttachTaskPayload) {
    return apiPost<{ success: boolean }>("tracker/attach-task", payload);
  },
};

export const analyticsApi = {
  ledger(params?: { start?: string; end?: string; mood?: string }) {
    return apiGet<{ rows: AnalyticsRowDto[]; total: number }>(
      "analytics/ledger",
      params as Record<string, string> | undefined,
    );
  },
};
