import { apiError } from "@/server/middleware/error-handler";
import type {
  CreateTaskInput,
  SetProgressInput,
  ToggleCompletionInput,
  UpdateTaskInput,
} from "./tasks.schemas";
import { tasksRepository } from "./tasks.repository";

function normalizeQuantityFields(input: {
  trackMode?: "checkbox" | "quantity";
  targetValue?: number | null;
  unit?: string | null;
  stepValue?: number;
}) {
  const trackMode = input.trackMode ?? "checkbox";
  if (trackMode === "checkbox") {
    return {
      trackMode: "checkbox" as const,
      targetValue: null,
      unit: null,
      stepValue: input.stepValue ?? 1,
    };
  }
  return {
    trackMode: "quantity" as const,
    targetValue: input.targetValue ?? null,
    unit: input.unit?.trim() || null,
    stepValue: input.stepValue ?? 1,
  };
}

export class TasksService {
  async listInRange(userId: string, start: string, end: string) {
    const [rows, completions, progress] = await Promise.all([
      tasksRepository.findInRange(userId, start, end),
      tasksRepository.listCompletions(userId),
      tasksRepository.listProgress(userId),
    ]);
    return { tasks: rows, completions, progress, range: { start, end } };
  }

  async getById(userId: string, id: string) {
    const task = await tasksRepository.findById(userId, id);
    if (!task) apiError("NOT_FOUND", "Task not found", 404);
    return task;
  }

  async create(userId: string, input: CreateTaskInput) {
    const qty = normalizeQuantityFields(input);
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
      ...qty,
    });
  }

  async update(userId: string, input: UpdateTaskInput) {
    const { id, ...rest } = input;
    const existing = await tasksRepository.findById(userId, id);
    if (!existing) apiError("NOT_FOUND", "Task not found", 404);

    const trackMode = rest.trackMode ?? existing.trackMode;
    const qty =
      rest.trackMode !== undefined ||
      rest.targetValue !== undefined ||
      rest.unit !== undefined ||
      rest.stepValue !== undefined
        ? normalizeQuantityFields({
            trackMode,
            targetValue: rest.targetValue !== undefined ? rest.targetValue : existing.targetValue,
            unit: rest.unit !== undefined ? rest.unit : existing.unit,
            stepValue: rest.stepValue !== undefined ? rest.stepValue : existing.stepValue,
          })
        : {};

    const updated = await tasksRepository.update(userId, id, {
      ...rest,
      ...qty,
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

    // Keep quantity progress in sync with checkbox toggle when applicable.
    if (task.trackMode === "quantity" && task.targetValue != null) {
      await tasksRepository.setProgressAmount(
        userId,
        input.taskId,
        input.occurrenceDate,
        input.completed ? task.targetValue : 0,
      );
    }

    return { success: true };
  }

  async setProgress(userId: string, input: SetProgressInput) {
    const task = await tasksRepository.findById(userId, input.taskId);
    if (!task) apiError("NOT_FOUND", "Task not found", 404);
    if (task.trackMode !== "quantity" || task.targetValue == null) {
      apiError("VALIDATION_ERROR", "This task is not a quantity goal", 400);
    }

    const target = task.targetValue as number;
    const existing = await tasksRepository.getProgress(userId, input.taskId, input.occurrenceDate);
    let next = existing?.amount ?? 0;

    if (input.completeAll) {
      next = target;
    } else if (input.amount !== undefined) {
      next = input.amount;
    } else if (input.delta !== undefined) {
      next = next + input.delta;
    } else {
      apiError("VALIDATION_ERROR", "Provide amount, delta, or completeAll", 400);
    }

    next = Math.max(0, Math.min(next, Math.max(target, 10000)));

    const progress = await tasksRepository.setProgressAmount(
      userId,
      input.taskId,
      input.occurrenceDate,
      next,
    );

    const completed = next >= target;
    await tasksRepository.toggleCompletion(userId, input.taskId, input.occurrenceDate, completed);

    return {
      progress,
      completed,
      targetValue: target,
      remaining: Math.max(0, target - next),
    };
  }
}

export const tasksService = new TasksService();
