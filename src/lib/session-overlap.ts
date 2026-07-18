export type HourRange = { startHour: number; endHour: number };

export function rangesOverlap(a: HourRange, b: HourRange): boolean {
  return a.startHour <= b.endHour && b.startHour <= a.endHour;
}

export function findOverlappingSession<
  T extends HourRange & { id: string; name?: string },
>(sessions: T[], candidate: HourRange, excludeId?: string): T | undefined {
  return sessions.find(
    (s) => s.id !== excludeId && rangesOverlap(s, candidate),
  );
}

/** Sentence-case session names for consistent timeline labels. */
export function formatSessionName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function getSessionRangeError<
  T extends HourRange & { id: string; name: string },
>(sessions: T[], range: HourRange, excludeId?: string): string | null {
  if (range.startHour > range.endHour) {
    return "Start time must be before end time.";
  }
  const overlap = findOverlappingSession(sessions, range, excludeId);
  if (overlap) {
    return `This time overlaps with "${overlap.name}".`;
  }
  return null;
}

export function isValidSessionStartHour<
  T extends HourRange & { id: string; name: string },
>(hour: number, endHour: number, sessions: T[], excludeId?: string): boolean {
  if (hour > endHour) return false;
  return getSessionRangeError(sessions, { startHour: hour, endHour }, excludeId) === null;
}

export function isValidSessionEndHour<
  T extends HourRange & { id: string; name: string },
>(hour: number, startHour: number, sessions: T[], excludeId?: string): boolean {
  if (hour < startHour) return false;
  return getSessionRangeError(sessions, { startHour, endHour: hour }, excludeId) === null;
}

export function hoursInSession(session: HourRange): number[] {
  const out: number[] = [];
  for (let h = session.startHour; h <= session.endHour; h++) out.push(h);
  return out;
}

/** Hours for a session, skipping any already claimed by an earlier session. */
export function resolveSessionHours(
  session: HourRange,
  claimed: Set<number>,
): number[] {
  const out: number[] = [];
  for (let h = session.startHour; h <= session.endHour; h++) {
    if (!claimed.has(h)) {
      claimed.add(h);
      out.push(h);
    }
  }
  return out;
}

/** Pick a start/end that does not overlap existing sessions. */
export function suggestNextSessionRange(
  sessions: HourRange[],
  fallbackStart: number,
  fallbackEnd: number,
): HourRange {
  const tryRange = (start: number, end: number): HourRange | null => {
    if (start > end) return null;
    const candidate = { startHour: start, endHour: end };
    if (!sessions.some((s) => rangesOverlap(s, candidate))) return candidate;
    return null;
  };

  if (sessions.length === 0) {
    return (
      tryRange(fallbackStart, Math.min(fallbackStart + 3, fallbackEnd)) ?? {
        startHour: fallbackStart,
        endHour: Math.min(fallbackStart + 3, fallbackEnd),
      }
    );
  }

  const byEnd = [...sessions].sort((a, b) => a.endHour - b.endHour);
  const lastEnd = byEnd[byEnd.length - 1].endHour;

  for (let start = lastEnd + 1; start <= 23; start++) {
    const end = Math.min(start + 2, 23);
    const hit = tryRange(start, end);
    if (hit) return hit;
  }

  for (let start = 0; start <= 23; start++) {
    const end = Math.min(start + 2, 23);
    const hit = tryRange(start, end);
    if (hit) return hit;
  }

  return { startHour: fallbackStart, endHour: Math.min(fallbackStart + 1, fallbackEnd) };
}
