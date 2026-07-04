import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";

export function useAnalyticsLedger(params?: { start?: string; end?: string; mood?: string }) {
  return useQuery({
    queryKey: ["analytics", "ledger", params],
    queryFn: () => analyticsApi.ledger(params),
  });
}
