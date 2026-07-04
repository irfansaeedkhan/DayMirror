import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import type { AnalyticsQuery } from "../tasks/tasks.schemas";
import { analyticsQuerySchema } from "../tasks/tasks.schemas";
import { analyticsService } from "./analytics.service";

export const analyticsController = new Hono<{ Variables: AppVariables }>();

analyticsController.get(
  "/ledger",
  zodValidator("query", analyticsQuerySchema),
  async (c) => {
    const query = getValidated<AnalyticsQuery>(c, "query");
    const data = await analyticsService.getLedger(c.get("userId"), query);
    return c.json({ data });
  },
);
