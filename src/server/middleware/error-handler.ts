import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import type { ZodError } from "zod";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function formatZodError(error: ZodError): ApiErrorBody {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: error.flatten(),
    },
  };
}

export function apiError(code: string, message: string, status: ContentfulStatusCode, details?: unknown): never {
  throw new HTTPException(status, {
    message,
    res: new Response(JSON.stringify({ error: { code, message, details } }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  });
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    const status = err.status;
    const message = err.message || "Request failed";
    return c.json<ApiErrorBody>(
      { error: { code: "HTTP_ERROR", message } },
      status,
    );
  }

  console.error("[api]", err);
  return c.json<ApiErrorBody>(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    500,
  );
}
