import type { TaskCompletionDto, TaskProgressDto } from "@/types/api";

export function buildCompletionsMap(completions: TaskCompletionDto[]) {
  const map = new Map<string, Set<string>>();
  for (const c of completions) {
    const set = map.get(c.taskId) ?? new Set();
    set.add(c.occurrenceDate);
    map.set(c.taskId, set);
  }
  return map;
}

export function buildProgressMap(progress: TaskProgressDto[]) {
  const map = new Map<string, Map<string, number>>();
  for (const p of progress) {
    const byDate = map.get(p.taskId) ?? new Map();
    byDate.set(p.occurrenceDate, p.amount);
    map.set(p.taskId, byDate);
  }
  return map;
}
