import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const taskRecurrenceSchema = z.enum(["none", "daily", "weekdays", "weekly", "monthly"]);
export const taskTrackModeSchema = z.enum(["checkbox", "quantity"]);
export const hourMoodSchema = z.enum(["success", "moderate", "wasted", "in_progress", "planning"]);

const taskFieldsSchema = z.object({
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
    trackMode: taskTrackModeSchema.default("checkbox"),
    targetValue: z.number().int().min(1).max(10000).nullable().optional(),
    unit: z.string().min(1).max(32).nullable().optional(),
    stepValue: z.number().int().min(1).max(1000).optional(),
  });

function validateQuantityGoal(
  value: {
    trackMode?: "checkbox" | "quantity";
    targetValue?: number | null;
    unit?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.trackMode === "quantity") {
    if (value.targetValue == null) {
      ctx.addIssue({
        code: "custom",
        message: "Target is required for quantity goals",
        path: ["targetValue"],
      });
    }
    if (!value.unit?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Unit is required for quantity goals",
        path: ["unit"],
      });
    }
  }
}

export const createTaskSchema = taskFieldsSchema.superRefine(validateQuantityGoal);

export const updateTaskSchema = taskFieldsSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .superRefine((value, ctx) => {
    // Full quantity validation is also enforced against existing values in the service.
    // Here, validate a request that explicitly switches to quantity mode.
    if (value.trackMode === "quantity") {
      validateQuantityGoal(value, ctx);
    }
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

export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
});

export const setProgressSchema = z.object({
  taskId: z.string().uuid(),
  occurrenceDate: z.string().date(),
  /** Absolute amount for the day, or omit when using delta / completeAll */
  amount: z.number().int().min(0).max(10000).optional(),
  /** Add/subtract from current (e.g. +4 push-ups) */
  delta: z.number().int().min(-10000).max(10000).optional(),
  /** Jump to target and mark complete */
  completeAll: z.boolean().optional(),
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
export type SetProgressInput = z.infer<typeof setProgressSchema>;
export type UpsertHourLogInput = z.infer<typeof upsertHourLogSchema>;
export type AttachTaskInput = z.infer<typeof attachTaskSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
