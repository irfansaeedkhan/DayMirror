import type { TaskDto } from "@/types/api";

/** Compare task scheduled time to an hour slot (0–23) on a given calendar day. */
export function taskOverlapsHour(task: TaskDto, hour: number, date: string): boolean {
  if (!task.startAt) return false;
  const slotStart = new Date(`${date}T00:00:00`);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setHours(hour + 1, 0, 0, 0);

  const start = new Date(task.startAt);
  const end = task.endAt ? new Date(task.endAt) : new Date(start.getTime() + 3600000);
  return start < slotEnd && end > slotStart;
}

/** Task was scheduled earlier today but not in this hour (e.g. missed morning block). */
export function taskScheduledEarlierToday(task: TaskDto, hour: number, date: string): boolean {
  if (!task.startAt || task.allDay) return false;
  const end = task.endAt ? new Date(task.endAt) : new Date(new Date(task.startAt).getTime() + 3600000);
  const slotStart = new Date(`${date}T00:00:00`);
  slotStart.setHours(hour, 0, 0, 0);
  return end <= slotStart;
}

export function partitionTasksForHour(tasks: TaskDto[], hour: number, date: string) {
  const fitsHour: TaskDto[] = [];
  const earlierToday: TaskDto[] = [];
  const otherToday: TaskDto[] = [];

  for (const t of tasks) {
    if (taskOverlapsHour(t, hour, date)) {
      fitsHour.push(t);
    } else if (taskScheduledEarlierToday(t, hour, date)) {
      earlierToday.push(t);
    } else {
      otherToday.push(t);
    }
  }

  return { fitsHour, earlierToday, otherToday };
}
