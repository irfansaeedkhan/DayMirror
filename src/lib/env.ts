import { z } from "zod";

/**
 * Server-side environment validation. Fails fast with a readable message
 * instead of crashing deep inside a query when a variable is missing.
 * Lazy so `next build` doesn't require production secrets.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  /** Comma-separated trusted origins for Better Auth CSRF (e.g. staging URL). */
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /** Dev-only impersonation id; ignored entirely in production. */
  DEV_USER_ID: z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional(),
  /** Comma-separated list of additional allowed CORS origins (e.g. staging URL). */
  ALLOWED_ORIGINS: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

export function getAllowedOrigins(): string[] {
  const env = getEnv();
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function getTrustedOrigins(): string[] {
  const env = getEnv();
  return (env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}
