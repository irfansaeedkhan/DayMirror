"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, LogOut, Moon, Plus, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { THEMES, useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/planner", label: "Planner" },
  { href: "/tracker", label: "Tracker" },
  { href: "/analytics", label: "Analytics" },
] as const;

type AppShellProps = {
  children: React.ReactNode;
  onNewTask?: () => void;
};

export function AppShell({ children, onNewTask }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolved } = useTheme();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="app-container flex h-14 items-center gap-4 lg:h-16 lg:gap-6">
          <Link href="/planner" className="text-base font-semibold tracking-tight lg:text-lg">
            DayMirror
          </Link>

          <nav className="flex items-center rounded-full bg-secondary p-1 text-sm lg:text-base">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 transition lg:px-4 lg:py-2",
                  pathname.startsWith(item.href)
                    ? "bg-card shadow-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {session?.user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 rounded-lg">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Theme">
                  {resolved === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {THEMES.map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id as Theme)} className="gap-2 rounded-lg">
                    <span className="size-4 rounded-full border border-border" style={{ background: t.swatch }} />
                    <span className="flex-1">{t.label}</span>
                    {theme === t.id && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={onNewTask} className="gap-1.5 rounded-full" size="default">
              <Plus className="size-4 lg:size-5" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="app-container flex-1 py-6 lg:py-8">{children}</main>
    </div>
  );
}
