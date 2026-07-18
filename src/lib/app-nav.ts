import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Clock,
  ListTodo,
  Sparkles,
  Timer,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AppNavFutureItem = {
  label: string;
  icon: LucideIcon;
  badge: string;
};

export const APP_NAV: AppNavItem[] = [
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/tracker", label: "Tracker", icon: Clock },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export const APP_NAV_FUTURE: AppNavFutureItem[] = [
  { label: "Todo list", icon: ListTodo, badge: "Soon" },
  { label: "Pomodoro", icon: Timer, badge: "Soon" },
  { label: "AI summary", icon: Sparkles, badge: "Soon" },
];

export function getPageTitle(pathname: string): string {
  const match = APP_NAV.find((item) => pathname.startsWith(item.href));
  return match?.label ?? "DayMirror";
}
