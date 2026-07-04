import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { hourLogTasks, hourLogs, userSettings, type HourLog, type NewHourLog } from "@/db/schema";

export type HourLogWithTasks = HourLog & {
  linkedTaskIds: string[];
};

export class TrackerRepository {
  async findDayLogs(userId: string, date: string): Promise<HourLogWithTasks[]> {
    const logs = await db
      .select()
      .from(hourLogs)
      .where(and(eq(hourLogs.userId, userId), eq(hourLogs.date, date)))
      .orderBy(hourLogs.hour);

    const links = await db
      .select()
      .from(hourLogTasks)
      .where(eq(hourLogTasks.userId, userId));

    const linksByLog = new Map<string, string[]>();
    for (const link of links) {
      const arr = linksByLog.get(link.hourLogId) ?? [];
      arr.push(link.taskId);
      linksByLog.set(link.hourLogId, arr);
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

  async getSettings(userId: string) {
    const [row] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return row ?? null;
  }
}

export const trackerRepository = new TrackerRepository();
