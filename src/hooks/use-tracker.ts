import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { trackerApi } from "@/lib/api";
import type {
  AttachTaskPayload,
  CreateSessionPayload,
  DayWindowPayload,
  TrackerSettingsPayload,
  UpdateSessionPayload,
  UpsertHourLogPayload,
} from "@/types/api";

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

export function useUpsertDayWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DayWindowPayload) => trackerApi.upsertDayWindow(payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["hour-logs", vars.date] }),
  });
}

export function useClearDayWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => trackerApi.clearDayWindow(date),
    onSuccess: (_data, date) => qc.invalidateQueries({ queryKey: ["hour-logs", date] }),
  });
}

export function useTrackerSettings(enabled = true) {
  return useQuery({
    queryKey: ["tracker-settings"],
    queryFn: () => trackerApi.getSettings(),
    enabled,
  });
}

export function useUpdateTrackerSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TrackerSettingsPayload) => trackerApi.updateSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hour-logs"] });
      qc.invalidateQueries({ queryKey: ["tracker-settings"] });
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => trackerApi.createSession(payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["hour-logs", vars.date] }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSessionPayload) => trackerApi.updateSession(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hour-logs"] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trackerApi.deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hour-logs"] }),
  });
}
