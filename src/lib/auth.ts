import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getEnv, getTrustedOrigins, isProduction } from "@/lib/env";

function createAuth() {
  const env = getEnv();

  const socialProviders =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account" as const,
          },
        }
      : undefined;

  return betterAuth({
    appName: "DayMirror",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: getTrustedOrigins(),

    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    ...(socialProviders ? { socialProviders } : {}),

    account: {
      encryptOAuthTokens: true,
      storeStateStrategy: "cookie",
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
        strategy: "compact",
      },
    },

    rateLimit: {
      enabled: isProduction(),
      storage: "memory",
    },

    advanced: {
      useSecureCookies: isProduction(),
      database: {
        generateId: "uuid",
      },
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      },
    },

    plugins: [nextCookies()],
  });
}

export const auth = createAuth();

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
