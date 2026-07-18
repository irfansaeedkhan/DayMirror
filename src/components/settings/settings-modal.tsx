"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrackerSettings, useUpdateTrackerSettings } from "@/hooks/use-tracker";
import { HOURS_IN_DAY } from "@/lib/constants";
import { formatHourLabel } from "@/lib/hour-utils";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const settingsQ = useTrackerSettings(open);
  const saveSettings = useUpdateTrackerSettings();

  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);

  useEffect(() => {
    if (!settingsQ.data?.settings) return;
    setStartHour(settingsQ.data.settings.defaultStartHour);
    setEndHour(settingsQ.data.settings.defaultEndHour);
  }, [settingsQ.data?.settings]);

  const busy = saveSettings.isPending;

  async function handleSaveHours() {
    if (startHour > endHour) {
      toast.error("Start hour must be before end hour");
      return;
    }
    try {
      await saveSettings.mutateAsync({ defaultStartHour: startHour, defaultEndHour: endHour });
      toast.success("Default session hours saved");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Default session hours for your auto-created &quot;My day&quot; session on new days.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">From</Label>
            <Select
              value={String(startHour)}
              onValueChange={(v) => setStartHour(Number(v))}
              disabled={busy || settingsQ.isLoading}
            >
              <SelectTrigger className="h-10 rounded-xl" aria-label="Default start hour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS_IN_DAY.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {formatHourLabel(h)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">To</Label>
            <Select
              value={String(endHour)}
              onValueChange={(v) => setEndHour(Number(v))}
              disabled={busy || settingsQ.isLoading}
            >
              <SelectTrigger className="h-10 rounded-xl" aria-label="Default end hour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS_IN_DAY.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {formatHourLabel(h)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <Button
            type="button"
            className="cursor-pointer rounded-full"
            disabled={busy || settingsQ.isLoading}
            onClick={handleSaveHours}
          >
            {busy ? "Saving…" : "Save default hours"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
