"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/tracker";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await signIn.email({
      email: email.trim(),
      password,
      callbackURL: redirect,
    });

    setPending(false);

    if (error) {
      toast.error(error.message ?? "Sign in failed");
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <GoogleSignInButton callbackURL={redirect} label="Sign in with Google" />
      <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl h-11"
        />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create one free
        </Link>
      </p>
      </form>
    </div>
  );
}
