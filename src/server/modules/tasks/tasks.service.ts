import { apiError } from "@/server/middleware/error-handler";
import type { CreateTaskInput, ToggleCompletionInput, UpdateTaskInput } from "./tasks.schemas";
import { tasksRepository } from "./tasks.repository";

export class TasksService {
  async listInRange(userId: string, start: string, end: string) {
    const rows = await tasksRepository.findInRange(userId, start, end);
    const completions = await tasksRepository.listCompletions(userId);
    return { tasks: rows, completions, range: { start, end } };
  }

  async getById(userId: string, id: string) {
    const task = await tasksRepository.findById(userId, id);
    if (!task) apiError("NOT_FOUND", "Task not found", 404);
    return task;
  }

  async create(userId: string, input: CreateTaskInput) {
    return tasksRepository.create(userId, {
      title: input.title,
      notes: input.notes ?? null,
      date: input.date,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      allDay: input.allDay,
      category: input.category,
      priority: input.priority,
      recurrence: input.recurrence,
      recurrenceUntil: input.recurrenceUntil ?? null,
    });
  }

  async update(userId: string, input: UpdateTaskInput) {
    const { id, ...rest } = input;
    const existing = await tasksRepository.findById(userId, id);
    if (!existing) apiError("NOT_FOUND", "Task not found", 404);

    const updated = await tasksRepository.update(userId, id, {
      ...rest,
      startAt: rest.startAt === undefined ? undefined : rest.startAt ? new Date(rest.startAt) : null,
      endAt: rest.endAt === undefined ? undefined : rest.endAt ? new Date(rest.endAt) : null,
      recurrenceUntil: rest.recurrenceUntil === undefined ? undefined : rest.recurrenceUntil,
    });

    return updated!;
  }

  async remove(userId: string, id: string) {
    const existing = await tasksRepository.findById(userId, id);
    if (!existing) apiError("NOT_FOUND", "Task not found", 404);
    await tasksRepository.delete(userId, id);
    return { success: true };
  }

  async toggleCompletion(userId: string, input: ToggleCompletionInput) {
    const task = await tasksRepository.findById(userId, input.taskId);
    if (!task) apiError("NOT_FOUND", "Task not found", 404);
    await tasksRepository.toggleCompletion(
      userId,
      input.taskId,
      input.occurrenceDate,
      input.completed,
    );
    return { success: true };
  }
}

export const tasksService = new TasksService();
