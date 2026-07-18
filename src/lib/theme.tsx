"use client";

import * as React from "react";

export type Theme = "system" | "light" | "dark";

export const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: "system", label: "System", swatch: "var(--swatch-system)" },
  { id: "light", label: "Light", swatch: "var(--swatch-light)" },
  { id: "dark", label: "Dark", swatch: "var(--swatch-dark)" },
];

const STORAGE_KEY = "daymirror-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
    if (prefersDark) html.classList.add("dark");
  } else {
    html.setAttribute("data-theme", theme);
    if (theme === "dark") html.classList.add("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "light";
    setThemeState(stored);
    applyTheme(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "light";
      if (stored === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const resolved: "light" | "dark" = React.useMemo(() => {
    if (theme !== "system") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
