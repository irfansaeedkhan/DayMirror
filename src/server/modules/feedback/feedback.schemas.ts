import { z } from "zod";

export const createFeedbackSchema = z.object({
  message: z.string().min(10, "Please write at least 10 characters").max(5000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  category: z.enum(["bug", "idea", "other"]).default("other"),
  page: z.string().max(200).nullable().optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
