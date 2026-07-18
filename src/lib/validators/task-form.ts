import { z } from "zod";

export const QUANTITY_UNITS = [
  "times",
  "glasses",
  "cups",
  "ml",
  "L",
  "reps",
  "mins",
  "pages",
  "steps",
] as const;

export const taskFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    notes: z.string().max(5000).optional(),
    date: z.string().date(),
    allDay: z.boolean(),
    start: z.string().optional(),
    end: z.string().optional(),
    category: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]),
    recurrence: z.enum(["none", "daily", "weekdays", "weekly", "monthly"]),
    recurrenceUntil: z.string().optional(),
    trackMode: z.enum(["checkbox", "quantity"]),
    targetValue: z.number().int().min(1).max(10000).optional(),
    unit: z.string().max(32).optional(),
    stepValue: z.number().int().min(1).max(1000).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.trackMode === "quantity") {
      if (v.targetValue == null || Number.isNaN(v.targetValue)) {
        ctx.addIssue({ code: "custom", message: "Enter a target", path: ["targetValue"] });
      }
      if (!v.unit?.trim()) {
        ctx.addIssue({ code: "custom", message: "Pick a unit", path: ["unit"] });
      }
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;
