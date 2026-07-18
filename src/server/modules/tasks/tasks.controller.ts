import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import { uuidParamSchema } from "@/server/middleware/uuid-param";
import {
  createTaskSchema,
  deleteTaskSchema,
  setProgressSchema,
  tasksRangeQuerySchema,
  toggleCompletionSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type SetProgressInput,
  type ToggleCompletionInput,
  type UpdateTaskInput,
} from "./tasks.schemas";
import { tasksService } from "./tasks.service";

export const tasksController = new Hono<{ Variables: AppVariables }>();

tasksController.get(
  "/",
  zodValidator("query", tasksRangeQuerySchema),
  async (c) => {
    const { start, end } = getValidated<{ start: string; end: string }>(c, "query");
    const data = await tasksService.listInRange(c.get("userId"), start, end);
    return c.json({ data });
  },
);

tasksController.get("/:id", zodValidator("param", uuidParamSchema), async (c) => {
  const { id } = getValidated<{ id: string }>(c, "param");
  const data = await tasksService.getById(c.get("userId"), id);
  return c.json({ data });
});

tasksController.post(
  "/",
  zodValidator("json", createTaskSchema),
  async (c) => {
    const body = getValidated<CreateTaskInput>(c, "json");
    const data = await tasksService.create(c.get("userId"), body);
    return c.json({ data }, 201);
  },
);

tasksController.patch(
  "/",
  zodValidator("json", updateTaskSchema),
  async (c) => {
    const body = getValidated<UpdateTaskInput>(c, "json");
    const data = await tasksService.update(c.get("userId"), body);
    return c.json({ data });
  },
);

tasksController.delete("/:id", zodValidator("param", uuidParamSchema), async (c) => {
  const { id } = getValidated<{ id: string }>(c, "param");
  const data = await tasksService.remove(c.get("userId"), id);
  return c.json({ data });
});

// POST fallback avoids a Hono/Next dev adapter private-state failure on DELETE.
tasksController.post(
  "/delete",
  zodValidator("json", deleteTaskSchema),
  async (c) => {
    const { id } = getValidated<{ id: string }>(c, "json");
    const data = await tasksService.remove(c.get("userId"), id);
    return c.json({ data });
  },
);

tasksController.post(
  "/completions/toggle",
  zodValidator("json", toggleCompletionSchema),
  async (c) => {
    const body = getValidated<ToggleCompletionInput>(c, "json");
    const data = await tasksService.toggleCompletion(c.get("userId"), body);
    return c.json({ data });
  },
);

tasksController.post(
  "/progress",
  zodValidator("json", setProgressSchema),
  async (c) => {
    const body = getValidated<SetProgressInput>(c, "json");
    const data = await tasksService.setProgress(c.get("userId"), body);
    return c.json({ data });
  },
);
