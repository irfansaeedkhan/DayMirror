import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";
import type {
  AnalyticsRowDto,
  AttachTaskPayload,
  CreateTaskPayload,
  DayWindowPayload,
  EffectiveWindowDto,
  HourLogDto,
  SetProgressPayload,
  TaskCompletionDto,
  TaskDto,
  TaskProgressDto,
  TrackerDayPayload,
  TrackerDayWindowDto,
  TrackerSettingsDto,
  TrackerSettingsPayload,
  TrackerSessionDto,
  CreateSessionPayload,
  UpdateSessionPayload,
  UpdateTaskPayload,
  UpsertHourLogPayload,
} from "@/types/api";

export const tasksApi = {
  listInRange(start: string, end: string) {
    return apiGet<{
      tasks: TaskDto[];
      completions: TaskCompletionDto[];
      progress: TaskProgressDto[];
    }>("tasks", { start, end });
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
    return apiPost<{ success: boolean }>("tasks/delete", { id });
  },
  toggleCompletion(taskId: string, occurrenceDate: string, completed: boolean) {
    return apiPost<{ success: boolean }>("tasks/completions/toggle", {
      taskId,
      occurrenceDate,
      completed,
    });
  },
  setProgress(payload: SetProgressPayload) {
    return apiPost<{
      progress: TaskProgressDto;
      completed: boolean;
      targetValue: number;
      remaining: number;
    }>("tasks/progress", payload);
  },
};

export const trackerApi = {
  getDay(date: string) {
    return apiGet<TrackerDayPayload>("tracker", { date });
  },
  upsert(payload: UpsertHourLogPayload) {
    return apiPost<HourLogDto>("tracker", payload);
  },
  attachTask(payload: AttachTaskPayload) {
    return apiPost<{ success: boolean }>("tracker/attach-task", payload);
  },
  upsertDayWindow(payload: DayWindowPayload) {
    return apiPut<{ dayWindow: TrackerDayWindowDto; effectiveWindow: EffectiveWindowDto }>(
      "tracker/day-window",
      payload,
    );
  },
  clearDayWindow(date: string) {
    return apiPost<{ effectiveWindow: EffectiveWindowDto }>("tracker/day-window/reset", { date });
  },
  getSettings() {
    return apiGet<{ settings: TrackerSettingsDto }>("tracker/settings");
  },
  updateSettings(payload: TrackerSettingsPayload) {
    return apiPatch<{ settings: TrackerSettingsDto }>("tracker/settings", payload);
  },
  createSession(payload: CreateSessionPayload) {
    return apiPost<{ session: TrackerSessionDto }>("tracker/sessions", payload);
  },
  updateSession(payload: UpdateSessionPayload) {
    return apiPatch<{ session: TrackerSessionDto }>("tracker/sessions", payload);
  },
  deleteSession(id: string) {
    return apiPost<{ success: boolean }>("tracker/sessions/delete", { id });
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
