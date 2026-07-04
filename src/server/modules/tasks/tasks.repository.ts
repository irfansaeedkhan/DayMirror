import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { taskCompletions, tasks, type NewTask, type Task } from "@/db/schema";

export class TasksRepository {
  async findInRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.date, startDate),
          lte(tasks.date, endDate),
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
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async listCompletions(userId: string) {
    return db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId));
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
}

export const tasksRepository = new TasksRepository();
