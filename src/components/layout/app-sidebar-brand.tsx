"use client";

import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebarBrand() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarHeader
      className={cn(
        "sidebar-header gap-0 pb-0 pt-2",
        collapsed ? "items-center px-1" : "px-2",
      )}
    >
      {collapsed ? (
        <div className="flex w-full flex-col items-center gap-2">
          <Link
            href="/tracker"
            className="sidebar-brand flex items-center justify-center rounded-lg outline-hidden transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sidebar-brand-mark flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              D
            </span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="sidebar-expand-trigger text-muted-foreground"
            aria-label="Expand sidebar"
            onClick={toggleSidebar}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex w-full items-center gap-1.5">
          <Link
            href="/tracker"
            className="sidebar-brand flex min-w-0 flex-1 items-center gap-2.5 rounded-lg outline-hidden transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sidebar-brand-mark flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              D
            </span>
            <span className="sidebar-brand-label truncate text-sm font-medium tracking-tight">DayMirror</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="sidebar-collapse-trigger shrink-0 text-muted-foreground"
            aria-label="Collapse sidebar"
            onClick={toggleSidebar}
          >
            <ChevronsLeft className="size-4" />
          </Button>
        </div>
      )}
    </SidebarHeader>
  );
}
