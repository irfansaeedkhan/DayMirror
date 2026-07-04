import type { Context, MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";
import { formatZodError } from "./error-handler";

type ValidationTarget = "json" | "query" | "param";

export function zodValidator<T extends ZodSchema>(
  target: ValidationTarget,
  schema: T,
): MiddlewareHandler {
  return async (c: Context, next) => {
    let raw: unknown;

    if (target === "json") {
      raw = await c.req.json().catch(() => undefined);
    } else if (target === "query") {
      raw = Object.fromEntries(new URL(c.req.url).searchParams.entries());
    } else {
      raw = c.req.param();
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return c.json(formatZodError(parsed.error), 400);
    }

    c.set(`validated_${target}`, parsed.data);
    await next();
  };
}

export function getValidated<T>(c: Context, target: ValidationTarget): T {
  return c.get(`validated_${target}`) as T;
}
