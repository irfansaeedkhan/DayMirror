"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { SettingsModal } from "@/components/settings/settings-modal";
import { AiGoalComingSoonModal } from "@/components/tasks/ai-goal-coming-soon-modal";
import { useResponsiveSidebarOpen } from "@/hooks/use-responsive-sidebar";
import { getPageTitle } from "@/lib/app-nav";

type AppShellProps = {
  children: React.ReactNode;
  onNewTask?: () => void;
};

export function AppShell({ children, onNewTask }: AppShellProps) {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiComingSoonOpen, setAiComingSoonOpen] = useState(false);
  const pageTitle = getPageTitle(pathname);
  const { open: sidebarOpen, onOpenChange: onSidebarOpenChange } = useResponsiveSidebarOpen();

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        className="app-shell-canvas"
        style={
          {
            "--sidebar-width": "13.5rem",
            "--sidebar-width-icon": "3.25rem",
          } as CSSProperties
        }
      >
        <AppSidebar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenFeedback={() => setFeedbackOpen(true)}
        />
        <SidebarInset className="app-main-panel">
          <header className="sticky top-0 z-30 flex h-11 shrink-0 items-center gap-2 border-b border-border/40 bg-surface-panel/90 px-3 backdrop-blur-md sm:gap-3 sm:px-4">
            <SidebarTrigger className="-ml-1" size="icon-sm" variant="ghost" />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink asChild>
                    <Link href="/tracker">DayMirror</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate">{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm">
                    <Plus />
                    <span className="hidden sm:inline">New</span>
                    <ChevronDown className="size-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => onNewTask?.()}
                  >
                    <Plus className="size-4" />
                    New task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => setAiComingSoonOpen(true)}
                  >
                    <Sparkles className="size-4" />
                    AI goal plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">{children}</main>
        </SidebarInset>

        <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        <AiGoalComingSoonModal open={aiComingSoonOpen} onOpenChange={setAiComingSoonOpen} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
