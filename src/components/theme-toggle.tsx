"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolved, setTheme } = useTheme();

  function toggle() {
    setTheme(resolved === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      {resolved === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
