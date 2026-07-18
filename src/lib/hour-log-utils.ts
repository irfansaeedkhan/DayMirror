import { hoursInSession } from "@/lib/session-overlap";
import type { HourLogDto } from "@/types/api";

export function hourLogHasData(log: HourLogDto): boolean {
  if (log.mood) return true;
  if (log.description?.trim()) return true;
  if (log.linkedTaskIds.length > 0) return true;
  return false;
}

export function countSessionLoggedHours(
  session: { startHour: number; endHour: number },
  logsByHour: Map<number, HourLogDto>,
): number {
  return hoursInSession(session).filter((hour) => {
    const log = logsByHour.get(hour);
    return log !== undefined && hourLogHasData(log);
  }).length;
}
