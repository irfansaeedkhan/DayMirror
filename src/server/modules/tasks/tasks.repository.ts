import { and, eq, gte, isNull, lte, ne, or } from "drizzle-orm";
import { db, getDb } from "@/db";
import {
  taskCompletions,
  taskProgress,
  tasks,
  type NewTask,
  type Task,
  type TaskProgress,
} from "@/db/schema";

export class TasksRepository {
  /**
   * Returns tasks that can appear in [startDate, endDate]:
   * - one-off tasks whose date falls in the range
   * - recurring series whose anchor is on/before end, and not ended before start
   * Callers must still expand with expandTasksForRange for occurrence dates.
   */
  async findInRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          or(
            and(eq(tasks.recurrence, "none"), gte(tasks.date, startDate), lte(tasks.date, endDate)),
            and(
              ne(tasks.recurrence, "none"),
              lte(tasks.date, endDate),
              or(isNull(tasks.recurrenceUntil), gte(tasks.recurrenceUntil, startDate)),
            ),
          ),
        ),
      )
      .orderBy(tasks.date);
  }

  async findById(userId: string, id: string): Promise<Task | undefined> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1);
    return row;
  }

  async create(userId: string, data: Omit<NewTask, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Task> {
    const [row] = await db
      .insert(tasks)
      .values({ ...data, userId })
      .returning();
    return row;
  }

  async update(userId: string, id: string, data: Partial<NewTask>): Promise<Task | undefined> {
    const [row] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return row;
  }

  async delete(userId: string, id: string): Promise<void> {
    // Returning materializes the query result and avoids a postgres-js
    // private-field receiver issue seen with bare DELETE under Next dev/HMR.
    await getDb()
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning({ id: tasks.id });
  }

  async listCompletions(userId: string) {
    return db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId));
  }

  async listProgress(userId: string): Promise<TaskProgress[]> {
    return db.select().from(taskProgress).where(eq(taskProgress.userId, userId));
  }

  async toggleCompletion(
    userId: string,
    taskId: string,
    occurrenceDate: string,
    completed: boolean,
  ): Promise<void> {
    if (completed) {
      await db
        .insert(taskCompletions)
        .values({ userId, taskId, occurrenceDate })
        .onConflictDoNothing();
      return;
    }

    await db
      .delete(taskCompletions)
      .where(
        and(
          eq(taskCompletions.userId, userId),
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.occurrenceDate, occurrenceDate),
        ),
      );
  }

  async getProgress(
    userId: string,
    taskId: string,
    occurrenceDate: string,
  ): Promise<TaskProgress | undefined> {
    const [row] = await db
      .select()
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.userId, userId),
          eq(taskProgress.taskId, taskId),
          eq(taskProgress.occurrenceDate, occurrenceDate),
        ),
      )
      .limit(1);
    return row;
  }

  async setProgressAmount(
    userId: string,
    taskId: string,
    occurrenceDate: string,
    amount: number,
  ): Promise<TaskProgress> {
    const [row] = await db
      .insert(taskProgress)
      .values({ userId, taskId, occurrenceDate, amount, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [taskProgress.taskId, taskProgress.occurrenceDate],
        set: { amount, updatedAt: new Date() },
      })
      .returning();
    return row;
  }
}

export const tasksRepository = new TasksRepository();
