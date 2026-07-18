"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/tracker")}>
          Go to Tracker
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
