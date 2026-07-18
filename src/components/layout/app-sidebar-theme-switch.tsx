"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppSidebarThemeSwitch() {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <div
      className="sidebar-theme-switch mx-1.5 flex rounded-full bg-secondary/60 p-0.5"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={isDark}
        onClick={() => setTheme("dark")}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-center rounded-full px-2 py-1 transition-colors duration-150",
          isDark && "bg-card text-foreground",
          !isDark && "text-muted-foreground hover:text-foreground",
        )}
      >
        <Moon className="size-3.5" />
        <span className="sidebar-theme-label ml-1.5 text-[11px] font-medium">Dark</span>
      </button>
      <button
        type="button"
        aria-label="Light mode"
        aria-pressed={!isDark}
        onClick={() => setTheme("light")}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-center rounded-full px-2 py-1 transition-colors duration-150",
          !isDark && "bg-card text-foreground",
          isDark && "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sun className="size-3.5" />
        <span className="sidebar-theme-label ml-1.5 text-[11px] font-medium">Light</span>
      </button>
    </div>
  );
}
