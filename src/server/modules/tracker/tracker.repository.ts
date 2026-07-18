import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { hourLogTasks, hourLogs, trackerDaySessions, trackerDayWindows, userSettings, type HourLog, type NewHourLog } from "@/db/schema";

export type HourLogWithTasks = HourLog & {
  linkedTaskIds: string[];
};

export type TrackerSettingsRow = {
  defaultStartHour: number;
  defaultEndHour: number;
};

export class TrackerRepository {
  async findDayLogs(userId: string, date: string): Promise<HourLogWithTasks[]> {
    const logs = await db
      .select()
      .from(hourLogs)
      .where(and(eq(hourLogs.userId, userId), eq(hourLogs.date, date)))
      .orderBy(hourLogs.hour);

    const logIds = logs.map((l) => l.id);
    const linksByLog = new Map<string, string[]>();

    if (logIds.length > 0) {
      const links = await db
        .select()
        .from(hourLogTasks)
        .where(and(eq(hourLogTasks.userId, userId), inArray(hourLogTasks.hourLogId, logIds)));

      for (const link of links) {
        const arr = linksByLog.get(link.hourLogId) ?? [];
        arr.push(link.taskId);
        linksByLog.set(link.hourLogId, arr);
      }
    }

    return logs.map((log) => ({
      ...log,
      linkedTaskIds: linksByLog.get(log.id) ?? [],
    }));
  }

  async upsert(
    userId: string,
    input: Pick<NewHourLog, "date" | "hour"> & Partial<Pick<NewHourLog, "description" | "mood" | "productivity">> & { id?: string },
  ): Promise<HourLog> {
    if (input.id) {
      const [row] = await db
        .update(hourLogs)
        .set({
          description: input.description,
          mood: input.mood,
          productivity: input.productivity,
          updatedAt: new Date(),
        })
        .where(and(eq(hourLogs.id, input.id), eq(hourLogs.userId, userId)))
        .returning();
      return row;
    }

    const [row] = await db
      .insert(hourLogs)
      .values({
        userId,
        date: input.date,
        hour: input.hour,
        description: input.description ?? null,
        mood: input.mood ?? null,
        productivity: input.productivity ?? 50,
      })
      .onConflictDoUpdate({
        target: [hourLogs.userId, hourLogs.date, hourLogs.hour],
        set: {
          description: input.description ?? null,
          mood: input.mood ?? null,
          productivity: input.productivity ?? 50,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  async attachTask(userId: string, hourLogId: string, taskId: string, attach: boolean): Promise<void> {
    if (attach) {
      await db
        .insert(hourLogTasks)
        .values({ userId, hourLogId, taskId })
        .onConflictDoNothing();
      return;
    }

    await db
      .delete(hourLogTasks)
      .where(
        and(
          eq(hourLogTasks.userId, userId),
          eq(hourLogTasks.hourLogId, hourLogId),
          eq(hourLogTasks.taskId, taskId),
        ),
      );
  }

  async findById(userId: string, id: string): Promise<HourLog | undefined> {
    const [row] = await db
      .select()
      .from(hourLogs)
      .where(and(eq(hourLogs.id, id), eq(hourLogs.userId, userId)))
      .limit(1);
    return row;
  }

  async getSettings(userId: string): Promise<TrackerSettingsRow | null> {
    const [row] = await db
      .select({
        defaultStartHour: userSettings.defaultStartHour,
        defaultEndHour: userSettings.defaultEndHour,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return row ?? null;
  }

  async upsertSettings(userId: string, input: TrackerSettingsRow) {
    const [row] = await db
      .insert(userSettings)
      .values({
        userId,
        defaultStartHour: input.defaultStartHour,
        defaultEndHour: input.defaultEndHour,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          defaultStartHour: input.defaultStartHour,
          defaultEndHour: input.defaultEndHour,
          updatedAt: new Date(),
        },
      })
      .returning({
        defaultStartHour: userSettings.defaultStartHour,
        defaultEndHour: userSettings.defaultEndHour,
      });
    return row;
  }

  async getDayWindow(userId: string, date: string) {
    const [row] = await db
      .select()
      .from(trackerDayWindows)
      .where(and(eq(trackerDayWindows.userId, userId), eq(trackerDayWindows.date, date)))
      .limit(1);
    return row ?? null;
  }

  async upsertDayWindow(userId: string, date: string, startHour: number, endHour: number) {
    const [row] = await db
      .insert(trackerDayWindows)
      .values({ userId, date, startHour, endHour })
      .onConflictDoUpdate({
        target: [trackerDayWindows.userId, trackerDayWindows.date],
        set: { startHour, endHour, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deleteDayWindow(userId: string, date: string) {
    await db
      .delete(trackerDayWindows)
      .where(and(eq(trackerDayWindows.userId, userId), eq(trackerDayWindows.date, date)));
  }

  async listDaySessions(userId: string, date: string) {
    return db
      .select()
      .from(trackerDaySessions)
      .where(and(eq(trackerDaySessions.userId, userId), eq(trackerDaySessions.date, date)))
      .orderBy(trackerDaySessions.sortOrder, trackerDaySessions.startHour);
  }

  async createDaySession(
    userId: string,
    input: { date: string; name: string; startHour: number; endHour: number },
  ) {
    const existing = await this.listDaySessions(userId, input.date);
    const sortOrder = existing.length > 0 ? Math.max(...existing.map((s) => s.sortOrder)) + 1 : 0;
    const [row] = await db
      .insert(trackerDaySessions)
      .values({ userId, ...input, sortOrder })
      .returning();
    return row;
  }

  async updateDaySession(
    userId: string,
    id: string,
    input: Partial<{ name: string; startHour: number; endHour: number }>,
  ) {
    const [row] = await db
      .update(trackerDaySessions)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(trackerDaySessions.id, id), eq(trackerDaySessions.userId, userId)))
      .returning();
    return row;
  }

  async deleteDaySession(userId: string, id: string) {
    await db
      .delete(trackerDaySessions)
      .where(and(eq(trackerDaySessions.id, id), eq(trackerDaySessions.userId, userId)));
  }

  /** Deletes hour logs (and cascaded task links) for an inclusive hour range on a date. */
  async deleteHourLogsInRange(
    userId: string,
    date: string,
    startHour: number,
    endHour: number,
  ): Promise<void> {
    await db
      .delete(hourLogs)
      .where(
        and(
          eq(hourLogs.userId, userId),
          eq(hourLogs.date, date),
          gte(hourLogs.hour, startHour),
          lte(hourLogs.hour, endHour),
        ),
      );
  }

  async findDaySessionById(userId: string, id: string) {
    const [row] = await db
      .select()
      .from(trackerDaySessions)
      .where(and(eq(trackerDaySessions.id, id), eq(trackerDaySessions.userId, userId)))
      .limit(1);
    return row ?? null;
  }
}

export const trackerRepository = new TrackerRepository();
