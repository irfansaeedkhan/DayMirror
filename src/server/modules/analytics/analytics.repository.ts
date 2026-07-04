import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { hourLogs, tasks } from "@/db/schema";
import type { AnalyticsQuery } from "../tasks/tasks.schemas";

export type AnalyticsRow = {
  id: string;
  date: string;
  hour: number;
  description: string | null;
  mood: string | null;
  productivity: number;
  linkedTasks: string[];
};

export class AnalyticsRepository {
  async listLedger(userId: string, query: AnalyticsQuery): Promise<AnalyticsRow[]> {
    const conditions = [eq(hourLogs.userId, userId)];

    if (query.start) conditions.push(gte(hourLogs.date, query.start));
    if (query.end) conditions.push(lte(hourLogs.date, query.end));
    if (query.mood) conditions.push(eq(hourLogs.mood, query.mood));

    const logs = await db
      .select()
      .from(hourLogs)
      .where(and(...conditions))
      .orderBy(desc(hourLogs.date), desc(hourLogs.hour));

    return logs.map((log) => ({
      id: log.id,
      date: log.date,
      hour: log.hour,
      description: log.description,
      mood: log.mood,
      productivity: log.productivity,
      linkedTasks: [],
    }));
  }

  async listTasksForContext(userId: string) {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.date));
  }
}

export const analyticsRepository = new AnalyticsRepository();
