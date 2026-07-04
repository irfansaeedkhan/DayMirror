import { z } from "zod";
import { attachTaskSchema, upsertHourLogSchema } from "../tasks/tasks.schemas";

export const dayQuerySchema = z.object({
  date: z.string().date(),
});

export { attachTaskSchema, upsertHourLogSchema };
