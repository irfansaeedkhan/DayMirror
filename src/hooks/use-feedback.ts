import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api-client";
import type { FeedbackDto } from "@/types/api";

export type SubmitFeedbackPayload = {
  message: string;
  rating?: number | null;
  category?: "bug" | "idea" | "other";
  page?: string | null;
};

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) =>
      apiPost<FeedbackDto>("feedback", payload),
  });
}
