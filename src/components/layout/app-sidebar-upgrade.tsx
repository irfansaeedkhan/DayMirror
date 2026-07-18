"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AppSidebarUpgradeCard() {
  return (
    <div className="sidebar-upgrade-card mx-1.5 rounded-xl border border-primary/15 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)] p-2.5">
      <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles className="size-3.5" />
      </div>
      <p className="text-xs font-medium tracking-tight">Boost with AI</p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        Smarter summaries and gentle nudges — coming soon.
      </p>
      <Button
        type="button"
        size="xs"
        className="mt-2 w-full"
        onClick={() => toast.message("Pro plans are on the roadmap — stay tuned.")}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
}
