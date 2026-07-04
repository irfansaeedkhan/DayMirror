import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { trackerApi } from "@/lib/api";
import type { AttachTaskPayload, UpsertHourLogPayload } from "@/types/api";

export function useDayHourLogs(date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["hour-logs", dateStr],
    queryFn: () => trackerApi.getDay(dateStr),
  });
}

export function useUpsertHourLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertHourLogPayload) => trackerApi.upsert(payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["hour-logs", vars.date] }),
  });
}

export function useAttachTaskToHour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttachTaskPayload) => trackerApi.attachTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hour-logs"] }),
  });
}
