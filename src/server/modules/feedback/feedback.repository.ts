import { db } from "@/db";
import { feedback } from "@/db/schema";
import type { CreateFeedbackInput } from "./feedback.schemas";

export class FeedbackRepository {
  async create(
    userId: string,
    input: CreateFeedbackInput,
    meta: { userAgent: string | null },
  ) {
    const [row] = await db
      .insert(feedback)
      .values({
        userId,
        message: input.message.trim(),
        rating: input.rating ?? null,
        category: input.category,
        page: input.page ?? null,
        userAgent: meta.userAgent,
      })
      .returning();

    return row;
  }
}

export const feedbackRepository = new FeedbackRepository();
