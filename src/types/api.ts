export type ApiSuccess<T> = { data: T };

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type TaskPriority = "low" | "medium" | "high";
export type TaskRecurrence = "none" | "daily" | "weekdays" | "weekly" | "monthly";
export type HourMood = "success" | "moderate" | "wasted" | "in_progress" | "planning";

export type TaskDto = {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  date: string;
  startAt: string | null;
  endAt: string | null;
  allDay: boolean;
  category: string;
  color: string;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  recurrenceUntil: string | null;
  parentTaskId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskCompletionDto = {
  id: string;
  userId: string;
  taskId: string;
  occurrenceDate: string;
  completedAt: string;
};

export type HourLogDto = {
  id: string;
  userId: string;
  date: string;
  hour: number;
  description: string | null;
  mood: HourMood | null;
  productivity: number;
  createdAt: string;
  updatedAt: string;
  linkedTaskIds: string[];
};

export type AnalyticsRowDto = {
  id: string;
  date: string;
  hour: number;
  description: string | null;
  mood: HourMood | null;
  productivity: number;
  linkedTasks: string[];
};

export type CreateTaskPayload = {
  title: string;
  notes?: string | null;
  date: string;
  startAt?: string | null;
  endAt?: string | null;
  allDay?: boolean;
  category?: string;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  recurrenceUntil?: string | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & { id: string };

export type UpsertHourLogPayload = {
  id?: string;
  date: string;
  hour: number;
  description?: string | null;
  mood?: HourMood | null;
  productivity?: number;
};

export type AttachTaskPayload = {
  hourLogId: string;
  taskId: string;
  attach: boolean;
};
