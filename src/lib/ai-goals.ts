/**
 * AI goal planner — schema & steps (disabled until an API key is configured).
 *
 * Planned flow:
 * 1. User describes a goal (e.g. "30-day JS interview plan").
 * 2. POST /api/goals/generate → LLM returns GoalPlanDraft (Zod-validated).
 * 3. Preview → user confirms → bulk insert tasks (optionally linked by goalId).
 * 4. Later: goals table + analytics on plan adherence.
 */

import { z } from "zod";

/** Feature flag — keep false until OPENAI_API_KEY / similar is available. */
export const AI_GOALS_ENABLED = process.env.NEXT_PUBLIC_AI_GOALS_ENABLED === "true";

export const goalPlanDraftSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().max(500).optional(),
  startDate: z.string().date(),
  days: z.number().int().min(1).max(90),
  tasks: z
    .array(
      z.object({
        dayOffset: z.number().int().min(0).max(89),
        title: z.string().min(1).max(200),
        notes: z.string().max(2000).optional(),
        category: z.string().min(1).max(50).default("learning"),
        allDay: z.boolean().default(false),
        startHour: z.number().int().min(0).max(23).optional(),
        endHour: z.number().int().min(0).max(23).optional(),
        trackMode: z.enum(["checkbox", "quantity"]).default("checkbox"),
        targetValue: z.number().int().min(1).max(10000).optional(),
        unit: z.string().max(32).optional(),
      }),
    )
    .min(1)
    .max(120),
});

export type GoalPlanDraft = z.infer<typeof goalPlanDraftSchema>;

export const AI_GOAL_STEPS = [
  "Describe the outcome and duration (e.g. 30 days).",
  "AI drafts one task per day with titles and notes.",
  "You preview and edit before anything is saved.",
  "Confirm → tasks are created on your calendar.",
] as const;
