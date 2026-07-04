import { apiError } from "@/server/middleware/error-handler";
import type { AttachTaskInput, UpsertHourLogInput } from "../tasks/tasks.schemas";
import { tasksRepository } from "../tasks/tasks.repository";
import { trackerRepository } from "./tracker.repository";

export class TrackerService {
  async getDayLogs(userId: string, date: string) {
    const logs = await trackerRepository.findDayLogs(userId, date);
    const settings = await trackerRepository.getSettings(userId);
    return {
      logs,
      settings: settings ?? {
        defaultStartHour: 1,
        defaultEndHour: 23,
      },
    };
  }

  async upsertHourLog(userId: string, input: UpsertHourLogInput) {
    if (input.id) {
      const existing = await trackerRepository.findById(userId, input.id);
      if (!existing) apiError("NOT_FOUND", "Hour log not found", 404);
    }

    return trackerRepository.upsert(userId, {
      id: input.id,
      date: input.date,
      hour: input.hour,
      description: input.description,
      mood: input.mood,
      productivity: input.productivity,
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
}

export const trackerService = new TrackerService();
