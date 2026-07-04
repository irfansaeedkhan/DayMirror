import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const taskRecurrenceSchema = z.enum(["none", "daily", "weekdays", "weekly", "monthly"]);
export const hourMoodSchema = z.enum(["success", "moderate", "wasted", "in_progress", "planning"]);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).nullable().optional(),
  date: z.string().date(),
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  allDay: z.boolean().default(true),
  category: z.string().min(1).max(50).default("other"),
  priority: taskPrioritySchema.default("medium"),
  recurrence: taskRecurrenceSchema.default("none"),
  recurrenceUntil: z.string().date().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export const tasksRangeQuerySchema = z.object({
  start: z.string().date(),
  end: z.string().date(),
});

export const toggleCompletionSchema = z.object({
  taskId: z.string().uuid(),
  occurrenceDate: z.string().date(),
  completed: z.boolean(),
});

export const upsertHourLogSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().date(),
  hour: z.number().int().min(0).max(23),
  description: z.string().max(2000).nullable().optional(),
  mood: hourMoodSchema.nullable().optional(),
  productivity: z.number().int().min(0).max(100).optional(),
});

export const attachTaskSchema = z.object({
  hourLogId: z.string().uuid(),
  taskId: z.string().uuid(),
  attach: z.boolean(),
});

export const analyticsQuerySchema = z.object({
  start: z.string().date().optional(),
  end: z.string().date().optional(),
  mood: hourMoodSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TasksRangeQuery = z.infer<typeof tasksRangeQuerySchema>;
export type ToggleCompletionInput = z.infer<typeof toggleCompletionSchema>;
export type UpsertHourLogInput = z.infer<typeof upsertHourLogSchema>;
export type AttachTaskInput = z.infer<typeof attachTaskSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
