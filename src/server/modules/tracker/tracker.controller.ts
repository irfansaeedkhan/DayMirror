import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import { attachTaskSchema, upsertHourLogSchema } from "../tasks/tasks.schemas";
import type { AttachTaskInput, UpsertHourLogInput } from "../tasks/tasks.schemas";
import {
  createSessionSchema,
  dayQuerySchema,
  dayWindowBodySchema,
  dayWindowDeleteQuerySchema,
  deleteSessionSchema,
  resetDayWindowSchema,
  trackerSettingsSchema,
  updateSessionSchema,
  type CreateSessionBody,
  type DayWindowBody,
  type TrackerSettingsBody,
  type UpdateSessionBody,
} from "./tracker.schemas";
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

trackerController.put(
  "/day-window",
  zodValidator("json", dayWindowBodySchema),
  async (c) => {
    const body = getValidated<DayWindowBody>(c, "json");
    const data = await trackerService.upsertDayWindow(c.get("userId"), body);
    return c.json({ data });
  },
);

trackerController.delete(
  "/day-window",
  zodValidator("query", dayWindowDeleteQuerySchema),
  async (c) => {
    const { date } = getValidated<{ date: string }>(c, "query");
    const data = await trackerService.clearDayWindow(c.get("userId"), date);
    return c.json({ data });
  },
);

trackerController.post(
  "/day-window/reset",
  zodValidator("json", resetDayWindowSchema),
  async (c) => {
    const { date } = getValidated<{ date: string }>(c, "json");
    const data = await trackerService.clearDayWindow(c.get("userId"), date);
    return c.json({ data });
  },
);

trackerController.get("/settings", async (c) => {
  const data = await trackerService.getTrackerSettings(c.get("userId"));
  return c.json({ data });
});

trackerController.patch(
  "/settings",
  zodValidator("json", trackerSettingsSchema),
  async (c) => {
    const body = getValidated<TrackerSettingsBody>(c, "json");
    const data = await trackerService.updateTrackerSettings(c.get("userId"), body);
    return c.json({ data });
  },
);

trackerController.post(
  "/sessions",
  zodValidator("json", createSessionSchema),
  async (c) => {
    const body = getValidated<CreateSessionBody>(c, "json");
    const data = await trackerService.createSession(c.get("userId"), body);
    return c.json({ data });
  },
);

trackerController.patch(
  "/sessions",
  zodValidator("json", updateSessionSchema),
  async (c) => {
    const body = getValidated<UpdateSessionBody>(c, "json");
    const data = await trackerService.updateSession(c.get("userId"), body);
    return c.json({ data });
  },
);

trackerController.post(
  "/sessions/delete",
  zodValidator("json", deleteSessionSchema),
  async (c) => {
    const { id } = getValidated<{ id: string }>(c, "json");
    const data = await trackerService.deleteSession(c.get("userId"), id);
    return c.json({ data });
  },
);
