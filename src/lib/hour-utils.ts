import { format } from "date-fns";

/** Format hour 0–23 as "6 AM", "3 PM", etc. */
export function formatHourLabel(hour: number): string {
  const d = new Date(2000, 0, 1, hour, 0);
  return format(d, "h a");
}

export function buildVisibleHours(startHour: number, endHour: number): number[] {
  const out: number[] = [];
  for (let h = startHour; h <= endHour; h++) out.push(h);
  return out;
}

export function hoursOutsideWindow(hours: number[], startHour: number, endHour: number): number[] {
  return [...new Set(hours)].filter((h) => h < startHour || h > endHour).sort((a, b) => a - b);
}
