/** Build ordered tracker timeline: session hours + rest gaps between sessions. */
import { hoursInSession, resolveSessionHours } from "@/lib/session-overlap";

export type TrackerSessionDto = {
  id: string;
  name: string;
  startHour: number;
  endHour: number;
  sortOrder: number;
};

export type RestGap = {
  startHour: number;
  endHour: number;
};

export type TrackerTimelineItem =
  | { type: "session-header"; sessionId: string; name: string }
  | { type: "hour"; hour: number; sessionId: string }
  | { type: "rest"; startHour: number; endHour: number };

export function computeRestGaps(sessions: TrackerSessionDto[]): RestGap[] {
  if (sessions.length < 2) return [];
  const sorted = [...sessions].sort((a, b) => a.startHour - b.startHour);
  const gaps: RestGap[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = sorted[i].endHour + 1;
    const gapEnd = sorted[i + 1].startHour - 1;
    if (gapStart <= gapEnd) gaps.push({ startHour: gapStart, endHour: gapEnd });
  }
  return gaps;
}

export function buildSessionTimeline(
  sessions: TrackerSessionDto[],
): TrackerTimelineItem[] {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort((a, b) => a.sortOrder - b.sortOrder || a.startHour - b.startHour);
  const restGaps = computeRestGaps(sorted);
  const claimed = new Set<number>();
  const items: TrackerTimelineItem[] = [];

  for (let si = 0; si < sorted.length; si++) {
    const session = sorted[si];
    const gap = si > 0 ? restGaps[si - 1] : undefined;
    if (gap) items.push({ type: "rest", startHour: gap.startHour, endHour: gap.endHour });

    const sessionHours = resolveSessionHours(session, claimed);
    if (sessionHours.length === 0) continue;

    items.push({ type: "session-header", sessionId: session.id, name: session.name });

    for (const h of sessionHours) {
      items.push({ type: "hour", hour: h, sessionId: session.id });
    }
  }

  return items;
}

export function buildSimpleTimeline(
  startHour: number,
  endHour: number,
): TrackerTimelineItem[] {
  const out: TrackerTimelineItem[] = [];
  for (let h = startHour; h <= endHour; h++) {
    out.push({ type: "hour", hour: h, sessionId: "simple" });
  }
  return out;
}

// Re-export for callers that need raw hour lists
export { hoursInSession } from "@/lib/session-overlap";
