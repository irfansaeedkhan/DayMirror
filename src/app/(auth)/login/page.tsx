import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — Chronos",
  description: "Sign in to Chronos — see where your day actually went.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Chronos
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to plan your day and track each hour.</p>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-elevated lg:p-8">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
