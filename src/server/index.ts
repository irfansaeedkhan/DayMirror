import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { getAllowedOrigins } from "@/lib/env";
import type { AppVariables } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limit";
import { tasksController } from "./modules/tasks/tasks.controller";
import { trackerController } from "./modules/tracker/tracker.controller";
import { analyticsController } from "./modules/analytics/analytics.controller";

const app = new Hono<{ Variables: AppVariables }>().basePath("/api");

app.onError(errorHandler);

app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    // Same-origin requests send no Origin header and pass through untouched;
    // cross-origin is only allowed for origins explicitly listed in env.
    origin: (origin) => (getAllowedOrigins().includes(origin) ? origin : null),
    credentials: true,
  }),
);
app.use("*", rateLimiter({ windowMs: 60_000, limit: 300 }));
app.use("*", bodyLimit({ maxSize: 100 * 1024 })); // 100kb — largest payload is a task with notes

app.get("/health", (c) => c.json({ data: { status: "ok", service: "chronos" } }));

app.use("/tasks/*", authMiddleware);
app.use("/tracker/*", authMiddleware);
app.use("/analytics/*", authMiddleware);

app.route("/tasks", tasksController);
app.route("/tracker", trackerController);
app.route("/analytics", analyticsController);

export { app };
