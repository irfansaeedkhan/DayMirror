import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { getAllowedOrigins } from "@/lib/env";
import type { AppVariables } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter, writeRateLimiter } from "./middleware/rate-limit";
import { tasksController } from "./modules/tasks/tasks.controller";
import { trackerController } from "./modules/tracker/tracker.controller";
import { analyticsController } from "./modules/analytics/analytics.controller";
import { feedbackController } from "./modules/feedback/feedback.controller";

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
app.use("*", rateLimiter({ windowMs: 60_000, limit: 300, keyPrefix: "global" }));
app.use("*", bodyLimit({ maxSize: 100 * 1024 })); // 100kb — largest payload is a task with notes

app.get(
  "/health",
  rateLimiter({ windowMs: 60_000, limit: 60, keyPrefix: "health" }),
  (c) => c.json({ data: { status: "ok", service: "daymirror" } }),
);

app.use("/tasks/*", authMiddleware);
app.use("/tasks/*", writeRateLimiter());
app.use("/tracker/*", authMiddleware);
app.use("/tracker/*", writeRateLimiter());
app.use("/analytics/*", authMiddleware);
app.use("/feedback/*", authMiddleware);
app.use("/feedback/*", writeRateLimiter());

app.route("/tasks", tasksController);
app.route("/tracker", trackerController);
app.route("/analytics", analyticsController);
app.route("/feedback", feedbackController);

export { app };
