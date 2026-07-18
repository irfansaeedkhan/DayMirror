import { apiError } from "@/server/middleware/error-handler";
import { DEFAULT_SESSION_NAME } from "@/lib/constants";
import { resolveUpsertProductivity } from "@/lib/hour-xp";
import { findOverlappingSession } from "@/lib/session-overlap";
import { computeRestGaps } from "@/lib/session-timeline";
import type { AttachTaskInput, UpsertHourLogInput } from "../tasks/tasks.schemas";
import { tasksRepository } from "../tasks/tasks.repository";
import type {
  CreateSessionBody,
  DayWindowBody,
  TrackerSettingsBody,
  UpdateSessionBody,
} from "./tracker.schemas";
import { trackerRepository } from "./tracker.repository";

const FALLBACK_SETTINGS = { defaultStartHour: 9, defaultEndHour: 17 };

export type EffectiveWindow = {
  startHour: number;
  endHour: number;
  source: "user_settings" | "day_override";
};

export function resolveEffectiveWindow(
  settings: { defaultStartHour: number; defaultEndHour: number },
  dayWindow: { startHour: number; endHour: number } | null,
): EffectiveWindow {
  if (dayWindow) {
    return {
      startHour: dayWindow.startHour,
      endHour: dayWindow.endHour,
      source: "day_override",
    };
  }
  return {
    startHour: settings.defaultStartHour,
    endHour: settings.defaultEndHour,
    source: "user_settings",
  };
}

function mapSession(row: {
  id: string;
  name: string;
  startHour: number;
  endHour: number;
  sortOrder: number;
}) {
  return {
    id: row.id,
    name: row.name,
    startHour: row.startHour,
    endHour: row.endHour,
    sortOrder: row.sortOrder,
  };
}

export class TrackerService {
  async getDayLogs(userId: string, date: string) {
    const logs = await trackerRepository.findDayLogs(userId, date);
    const settings = (await trackerRepository.getSettings(userId)) ?? FALLBACK_SETTINGS;
    const dayWindow = await trackerRepository.getDayWindow(userId, date);
    const effectiveWindow = resolveEffectiveWindow(settings, dayWindow);

    let sessionRows = await trackerRepository.listDaySessions(userId, date);
    if (sessionRows.length === 0) {
      const created = await trackerRepository.createDaySession(userId, {
        date,
        name: DEFAULT_SESSION_NAME,
        startHour: effectiveWindow.startHour,
        endHour: effectiveWindow.endHour,
      });
      sessionRows = [created];
    }

    const sessions = sessionRows.map(mapSession);
    const restGaps = computeRestGaps(sessions);

    return {
      logs,
      settings,
      dayWindow: dayWindow
        ? { date: dayWindow.date, startHour: dayWindow.startHour, endHour: dayWindow.endHour }
        : null,
      effectiveWindow,
      sessions,
      restGaps,
      viewMode: "sessions" as const,
    };
  }
  async upsertHourLog(userId: string, input: UpsertHourLogInput) {
    let existing: Awaited<ReturnType<typeof trackerRepository.findById>> | null = null;
    if (input.id) {
      existing = await trackerRepository.findById(userId, input.id);
      if (!existing) apiError("NOT_FOUND", "Hour log not found", 404);
    }

    const mood = input.mood !== undefined ? input.mood : (existing?.mood ?? null);
    const productivity = resolveUpsertProductivity(input, existing);

    return trackerRepository.upsert(userId, {
      id: input.id,
      date: input.date,
      hour: input.hour,
      description: input.description,
      mood,
      productivity,
    });
  }

  async attachTask(userId: string, input: AttachTaskInput) {
    const log = await trackerRepository.findById(userId, input.hourLogId);
    if (!log) apiError("NOT_FOUND", "Hour log not found", 404);

    if (input.attach) {
      const task = await tasksRepository.findById(userId, input.taskId);
      if (!task) apiError("NOT_FOUND", "Task not found", 404);
    }

    await trackerRepository.attachTask(userId, input.hourLogId, input.taskId, input.attach);
    return { success: true };
  }

  async upsertDayWindow(userId: string, input: DayWindowBody) {
    const settings = (await trackerRepository.getSettings(userId)) ?? FALLBACK_SETTINGS;
    const row = await trackerRepository.upsertDayWindow(
      userId,
      input.date,
      input.startHour,
      input.endHour,
    );
    const effectiveWindow = resolveEffectiveWindow(settings, row);
    return {
      dayWindow: { date: row.date, startHour: row.startHour, endHour: row.endHour },
      effectiveWindow,
    };
  }

  async clearDayWindow(userId: string, date: string) {
    const settings = (await trackerRepository.getSettings(userId)) ?? FALLBACK_SETTINGS;
    await trackerRepository.deleteDayWindow(userId, date);
    return { effectiveWindow: resolveEffectiveWindow(settings, null) };
  }

  async updateTrackerSettings(userId: string, input: TrackerSettingsBody) {
    const settings = await trackerRepository.upsertSettings(userId, input);
    return { settings };
  }

  async getTrackerSettings(userId: string) {
    const settings = (await trackerRepository.getSettings(userId)) ?? FALLBACK_SETTINGS;
    return { settings };
  }

  async createSession(userId: string, input: CreateSessionBody) {
    if (input.startHour > input.endHour) {
      apiError("VALIDATION_ERROR", "Start hour must be before or equal to end hour", 400);
    }

    const existing = await trackerRepository.listDaySessions(userId, input.date);
    const overlap = findOverlappingSession(existing, input);
    if (overlap) {
      apiError(
        "VALIDATION_ERROR",
        `Overlaps with "${overlap.name}". Each hour can only belong to one session.`,
        400,
      );
    }

    const row = await trackerRepository.createDaySession(userId, input);
    return { session: mapSession(row) };
  }

  async updateSession(userId: string, input: UpdateSessionBody) {
    const existing = await trackerRepository.findDaySessionById(userId, input.id);
    if (!existing) apiError("NOT_FOUND", "Session not found", 404);

    const startHour = input.startHour ?? existing.startHour;
    const endHour = input.endHour ?? existing.endHour;
    if (startHour > endHour) {
      apiError("VALIDATION_ERROR", "Start hour must be before or equal to end hour", 400);
    }

    const daySessions = await trackerRepository.listDaySessions(userId, existing.date);
    const overlap = findOverlappingSession(daySessions, { startHour, endHour }, input.id);
    if (overlap) {
      apiError(
        "VALIDATION_ERROR",
        `Overlaps with "${overlap.name}". Each hour can only belong to one session.`,
        400,
      );
    }

    const row = await trackerRepository.updateDaySession(userId, input.id, {
      name: input.name,
      startHour: input.startHour,
      endHour: input.endHour,
    });
    if (!row) apiError("NOT_FOUND", "Session not found", 404);
    return { session: mapSession(row) };
  }

  async deleteSession(userId: string, id: string) {
    const existing = await trackerRepository.findDaySessionById(userId, id);
    if (!existing) apiError("NOT_FOUND", "Session not found", 404);

    const daySessions = await trackerRepository.listDaySessions(userId, existing.date);
    if (daySessions.length <= 1) {
      apiError(
        "VALIDATION_ERROR",
        "Keep at least one session. Rename it or adjust the hours instead.",
        400,
      );
    }

    // Match UI copy: remove logged hours in this session's inclusive range.
    await trackerRepository.deleteHourLogsInRange(
      userId,
      existing.date,
      existing.startHour,
      existing.endHour,
    );
    await trackerRepository.deleteDaySession(userId, id);
    return { success: true };
  }
}

export const trackerService = new TrackerService();
