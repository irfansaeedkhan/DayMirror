import { Hono } from "hono";
import type { AppVariables } from "@/server/middleware/auth";
import { getValidated, zodValidator } from "@/server/middleware/zod-validator";
import {
  createTaskSchema,
  tasksRangeQuerySchema,
  toggleCompletionSchema,
  updateTaskSchema,
  type CreateTaskInput,
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

tasksController.get("/:id", async (c) => {
  const data = await tasksService.getById(c.get("userId"), c.req.param("id"));
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

tasksController.delete("/:id", async (c) => {
  const data = await tasksService.remove(c.get("userId"), c.req.param("id"));
  return c.json({ data });
});

tasksController.post(
  "/completions/toggle",
  zodValidator("json", toggleCompletionSchema),
  async (c) => {
    const body = getValidated<ToggleCompletionInput>(c, "json");
    const data = await tasksService.toggleCompletion(c.get("userId"), body);
    return c.json({ data });
  },
);
