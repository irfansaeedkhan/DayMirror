import type { AnalyticsQuery } from "../tasks/tasks.schemas";
import { analyticsRepository } from "./analytics.repository";

export class AnalyticsService {
  async getLedger(userId: string, query: AnalyticsQuery) {
    const rows = await analyticsRepository.listLedger(userId, query);
    return { rows, total: rows.length };
  }
}

export const analyticsService = new AnalyticsService();
