import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — DayMirror",
  description: "Create a free DayMirror account — reflect on every hour.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            DayMirror
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Start free</h1>
          <p className="text-muted-foreground">See where your day actually went.</p>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-elevated lg:p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
