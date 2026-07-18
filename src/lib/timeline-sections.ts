import type { TrackerTimelineItem } from "@/lib/session-timeline";
import type { TrackerSessionDto } from "@/types/api";

export type TimelineSection =
  | { kind: "session"; sessionId: string; name: string; startHour: number; endHour: number; hours: number[] }
  | { kind: "rest"; startHour: number; endHour: number };

export function groupSessionTimeline(
  timeline: TrackerTimelineItem[],
  sessions: TrackerSessionDto[],
): TimelineSection[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const sections: TimelineSection[] = [];
  let current: { sessionId: string; name: string; hours: number[] } | null = null;

  function flushSession() {
    if (!current) return;
    const meta = sessionById.get(current.sessionId);
    sections.push({
      kind: "session",
      sessionId: current.sessionId,
      name: current.name,
      startHour: current.hours[0] ?? meta?.startHour ?? 0,
      endHour: current.hours[current.hours.length - 1] ?? meta?.endHour ?? 0,
      hours: current.hours,
    });
    current = null;
  }

  for (const item of timeline) {
    if (item.type === "rest") {
      flushSession();
      sections.push({ kind: "rest", startHour: item.startHour, endHour: item.endHour });
    } else if (item.type === "session-header") {
      flushSession();
      current = { sessionId: item.sessionId, name: item.name, hours: [] };
    } else if (item.type === "hour" && current) {
      current.hours.push(item.hour);
    }
  }
  flushSession();
  return sections;
}

export function sessionContainsHour(session: { startHour: number; endHour: number }, hour: number) {
  return hour >= session.startHour && hour <= session.endHour;
}
