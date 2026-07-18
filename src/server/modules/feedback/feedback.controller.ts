import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import { createFeedbackSchema, type CreateFeedbackInput } from "./feedback.schemas";
import { feedbackService } from "./feedback.service";

export const feedbackController = new Hono<{ Variables: AppVariables }>();

feedbackController.post(
  "/",
  rateLimiter({ windowMs: 60 * 60 * 1000, limit: 10, keyPrefix: "feedback" }),
  zodValidator("json", createFeedbackSchema),
  async (c) => {
    const body = getValidated<CreateFeedbackInput>(c, "json");
    const data = await feedbackService.submit(c.get("userId"), body, {
      userAgent: c.req.header("user-agent") ?? null,
    });
    return c.json({ data }, 201);
  },
);
