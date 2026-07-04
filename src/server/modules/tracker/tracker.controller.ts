import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import { attachTaskSchema, dayQuerySchema, upsertHourLogSchema } from "./tracker.schemas";
import type { AttachTaskInput, UpsertHourLogInput } from "../tasks/tasks.schemas";
import { trackerService } from "./tracker.service";

export const trackerController = new Hono<{ Variables: AppVariables }>();

trackerController.get(
  "/",
  zodValidator("query", dayQuerySchema),
  async (c) => {
    const { date } = getValidated<{ date: string }>(c, "query");
    const data = await trackerService.getDayLogs(c.get("userId"), date);
    return c.json({ data });
  },
);

trackerController.post(
  "/",
  zodValidator("json", upsertHourLogSchema),
  async (c) => {
    const body = getValidated<UpsertHourLogInput>(c, "json");
    const data = await trackerService.upsertHourLog(c.get("userId"), body);
    return c.json({ data });
  },
);

trackerController.post(
  "/attach-task",
  zodValidator("json", attachTaskSchema),
  async (c) => {
    const body = getValidated<AttachTaskInput>(c, "json");
    const data = await trackerService.attachTask(c.get("userId"), body);
    return c.json({ data });
  },
);
