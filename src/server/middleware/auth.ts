import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { getEnv, isProduction } from "@/lib/env";

export type AppVariables = {
  userId: string;
  sessionId: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves the authenticated user from a Better Auth session cookie.
 * In development only, falls back to x-user-id / DEV_USER_ID for local testing.
 */
export async function authMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;

  try {
    session = await auth.api.getSession({ headers: c.req.raw.headers });
  } catch (error) {
    if (!isProduction()) {
      console.warn("[auth-middleware] Session lookup failed:", error);
    }
  }

  if (session?.user?.id) {
    c.set("userId", session.user.id);
    c.set("sessionId", session.session.id);
    return next();
  }

  if (!isProduction()) {
    const userId = c.req.header("x-user-id") ?? getEnv().DEV_USER_ID;
    if (userId && UUID_RE.test(userId)) {
      c.set("userId", userId);
      c.set("sessionId", "dev-session");
      return next();
    }
  }

  throw new HTTPException(401, { message: "Unauthorized" });
}
