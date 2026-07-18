import type { CreateFeedbackInput } from "./feedback.schemas";
import { feedbackRepository } from "./feedback.repository";

export class FeedbackService {
  async submit(
    userId: string,
    input: CreateFeedbackInput,
    meta: { userAgent: string | null },
  ) {
    return feedbackRepository.create(userId, input, meta);
  }
}

export const feedbackService = new FeedbackService();
