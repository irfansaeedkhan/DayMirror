import { z } from "zod";

export const taskFormSchema = z.object({
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
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
