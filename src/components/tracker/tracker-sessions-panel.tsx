"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatHourLabel } from "@/lib/hour-utils";
import {
  findOverlappingSession,
  formatSessionName,
  getSessionRangeError,
  isValidSessionEndHour,
  isValidSessionStartHour,
  suggestNextSessionRange,
} from "@/lib/session-overlap";
import { sessionContainsHour } from "@/lib/timeline-sections";
import { parseDateOnlyOrFallback } from "@/lib/date-utils";
import { countSessionLoggedHours } from "@/lib/hour-log-utils";
import { HOURS_IN_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCreateSession, useDeleteSession, useDayHourLogs, useUpdateSession } from "@/hooks/use-tracker";
import type { HourLogDto, TrackerSessionDto } from "@/types/api";

type SessionsBarProps = {
  date: string;
  sessions: TrackerSessionDto[];
  defaultStartHour: number;
  defaultEndHour: number;
  nowHour?: number;
};

type SheetView = "manage" | "add";

function formatRange(start: number, end: number) {
  return start === end
    ? formatHourLabel(start)
    : `${formatHourLabel(start)} – ${formatHourLabel(end)}`;
}

function validateNoOverlap(
  sessions: TrackerSessionDto[],
  range: { startHour: number; endHour: number },
  excludeId?: string,
) {
  const overlap = findOverlappingSession(sessions, range, excludeId);
  if (overlap) {
    toast.error(`Overlaps with "${overlap.name}". Each hour can only belong to one session.`);
    return false;
  }
  return true;
}

export function TrackerSessionsBar({
  date,
  sessions,
  defaultStartHour,
  defaultEndHour,
  nowHour,
}: SessionsBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>("manage");
  const [focusId, setFocusId] = useState<string | null>(null);
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => a.startHour - b.startHour || a.sortOrder - b.sortOrder),
    [sessions],
  );

  function openManage(sessionId?: string) {
    setFocusId(sessionId ?? null);
    setSheetView("manage");
    setSheetOpen(true);
  }

  function openAdd() {
    setFocusId(null);
    setSheetView("add");
    setSheetOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl bg-card px-2.5 py-2 shadow-elevated sm:flex-row sm:items-center sm:gap-2">
        <div className="flex items-center justify-between gap-2 sm:contents">
          <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sessions
          </p>

          <div className="flex shrink-0 items-center gap-1 sm:order-last">
            <div className="hidden items-center gap-1 sm:flex">
              <Button type="button" variant="outline" size="xs" onClick={openAdd}>
                <Plus />
                Add
              </Button>
              <Button type="button" variant="outline" size="xs" onClick={() => openManage()}>
                <Settings2 />
                Edit
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="sm:hidden"
                  aria-label="Session actions"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    openAdd();
                  }}
                >
                  <Plus className="size-4" />
                  Add session
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    openManage();
                  }}
                >
                  <Settings2 className="size-4" />
                  Edit sessions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="sessions-scroll-fade -mx-0.5 min-w-0 flex-1 overflow-x-auto px-0.5 pb-0.5 scrollbar-none sm:mx-0 sm:pb-0">
          <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-0.5 pr-1">
            {sorted.length === 0 ? (
              <span className="px-2 py-1 text-[11px] text-muted-foreground">Loading sessions…</span>
            ) : (
              sorted.map((session) => {
                const active = nowHour !== undefined && sessionContainsHour(session, nowHour);
                return (
                  <button
                    key={session.id}
                    type="button"
                    title={`${formatSessionName(session.name)} · ${formatRange(session.startHour, session.endHour)}`}
                    onClick={() => openManage(session.id)}
                    className={cn(
                      "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] transition-colors duration-200 sm:px-3 sm:py-1",
                      active
                        ? "bg-card text-foreground shadow-elevated"
                        : "text-muted-foreground hover:bg-hover hover:text-foreground",
                    )}
                  >
                    <span className="font-medium text-foreground">{formatSessionName(session.name)}</span>
                    <span className="mx-1 hidden text-muted-foreground/50 sm:inline">·</span>
                    <span className="hidden tabular-nums sm:inline">
                      {formatRange(session.startHour, session.endHour)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <SessionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        view={sheetView}
        onViewChange={setSheetView}
        date={date}
        sessions={sorted}
        focusId={focusId}
        defaultStartHour={defaultStartHour}
        defaultEndHour={defaultEndHour}
      />
    </>
  );
}

type SessionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: SheetView;
  onViewChange: (view: SheetView) => void;
  date: string;
  sessions: TrackerSessionDto[];
  focusId: string | null;
  defaultStartHour: number;
  defaultEndHour: number;
};

function SessionsSheet({
  open,
  onOpenChange,
  view,
  onViewChange,
  date,
  sessions,
  focusId,
  defaultStartHour,
  defaultEndHour,
}: SessionsSheetProps) {
  const isAdd = view === "add";
  const logsQ = useDayHourLogs(parseDateOnlyOrFallback(date));
  const logsByHour = useMemo(() => {
    const map = new Map<number, HourLogDto>();
    (logsQ.data?.logs ?? []).forEach((log) => map.set(log.hour, log));
    return map;
  }, [logsQ.data?.logs]);

  useEffect(() => {
    if (open) return;
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
  }, [open]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) onViewChange("manage");
  }

  function handleCreated() {
    handleOpenChange(false);
  }

  function handleCancelAdd() {
    handleOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
          <SheetTitle>{isAdd ? "Add session" : "Sessions"}</SheetTitle>
          <SheetDescription>
            {isAdd
              ? "Name your session and set the hours. Time between sessions is rest."
              : "Adjust names and hours for today. Gaps between sessions count as rest."}
          </SheetDescription>
        </SheetHeader>

        {isAdd ? (
          <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
            <SessionAddForm
              key={`add-${sessions.length}-${open}`}
              date={date}
              sessions={sessions}
              defaultStartHour={defaultStartHour}
              defaultEndHour={defaultEndHour}
              onCreated={handleCreated}
              onCancel={handleCancelAdd}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionEditCard
                  key={session.id}
                  session={session}
                  allSessions={sessions}
                  logsByHour={logsByHour}
                  autoFocus={focusId === session.id}
                  canDelete={sessions.length > 1}
                />
              ))}
            </div>
          </div>
        )}

        {!isAdd && (
          <div className="border-t border-border/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer gap-2 rounded-full"
              onClick={() => onViewChange("add")}
            >
              <Plus className="size-4" />
              Add session
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SessionHourFields({
  startHour,
  endHour,
  onStartChange,
  onEndChange,
  sessions,
  excludeId,
  disabled,
}: {
  startHour: number;
  endHour: number;
  onStartChange: (hour: number) => void;
  onEndChange: (hour: number) => void;
  sessions: TrackerSessionDto[];
  excludeId?: string;
  disabled?: boolean;
}) {
  const rangeError = getSessionRangeError(sessions, { startHour, endHour }, excludeId);
  const invalid = rangeError !== null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Select
            value={String(startHour)}
            onValueChange={(v) => onStartChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn("h-9 rounded-lg text-sm", invalid && "border-destructive")}
              aria-label="Session start"
              aria-invalid={invalid}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOURS_IN_DAY.map((h) => (
                <SelectItem
                  key={h}
                  value={String(h)}
                  disabled={!isValidSessionStartHour(h, endHour, sessions, excludeId)}
                >
                  {formatHourLabel(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Select
            value={String(endHour)}
            onValueChange={(v) => onEndChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn("h-9 rounded-lg text-sm", invalid && "border-destructive")}
              aria-label="Session end"
              aria-invalid={invalid}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOURS_IN_DAY.map((h) => (
                <SelectItem
                  key={h}
                  value={String(h)}
                  disabled={!isValidSessionEndHour(h, startHour, sessions, excludeId)}
                >
                  {formatHourLabel(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {rangeError && <p className="text-sm text-destructive">{rangeError}</p>}
    </div>
  );
}

function SessionAddForm({
  date,
  sessions,
  defaultStartHour,
  defaultEndHour,
  onCreated,
  onCancel,
}: {
  date: string;
  sessions: TrackerSessionDto[];
  defaultStartHour: number;
  defaultEndHour: number;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const createSession = useCreateSession();
  const defaults = suggestNextSessionRange(sessions, defaultStartHour, defaultEndHour);
  const [name, setName] = useState("");
  const [startHour, setStartHour] = useState(defaults.startHour);
  const [endHour, setEndHour] = useState(defaults.endHour);
  const rangeError = getSessionRangeError(sessions, { startHour, endHour });

  async function handleCreate() {
    const formattedName = formatSessionName(name);
    if (!formattedName) {
      toast.error("Enter a session name");
      return;
    }
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    if (!validateNoOverlap(sessions, { startHour, endHour })) return;
    try {
      await createSession.mutateAsync({ date, name: formattedName, startHour, endHour });
      toast.success("Session added");
      setName("");
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add session");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-session-name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="new-session-name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName(formatSessionName(name))}
            disabled={createSession.isPending}
            className="h-9 rounded-lg text-sm"
            placeholder="e.g. Deep work"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>

        <SessionHourFields
          startHour={startHour}
          endHour={endHour}
          onStartChange={setStartHour}
          onEndChange={setEndHour}
          sessions={sessions}
          disabled={createSession.isPending}
        />
      </div>

      <div className="mt-6 flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 cursor-pointer rounded-full"
          disabled={createSession.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 cursor-pointer rounded-full"
          disabled={createSession.isPending || !!rangeError || !name.trim()}
          onClick={handleCreate}
        >
          {createSession.isPending ? "Adding…" : "Add session"}
        </Button>
      </div>
    </div>
  );
}

function SessionEditCard({
  session,
  allSessions,
  logsByHour,
  autoFocus,
  canDelete,
}: {
  session: TrackerSessionDto;
  allSessions: TrackerSessionDto[];
  logsByHour: Map<number, HourLogDto>;
  autoFocus?: boolean;
  canDelete: boolean;
}) {
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const [name, setName] = useState(session.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const busy = updateSession.isPending || deleteSession.isPending;
  const loggedHourCount = useMemo(
    () => countSessionLoggedHours(session, logsByHour),
    [session, logsByHour],
  );

  useEffect(() => {
    setName(session.name);
  }, [session.name]);

  async function handleUpdate(patch: Partial<Pick<TrackerSessionDto, "name" | "startHour" | "endHour">>) {
    const nextStart = patch.startHour ?? session.startHour;
    const nextEnd = patch.endHour ?? session.endHour;
    const nextName = patch.name !== undefined ? formatSessionName(patch.name) : session.name;

    const rangeError = getSessionRangeError(
      allSessions,
      { startHour: nextStart, endHour: nextEnd },
      session.id,
    );
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    if (
      (patch.startHour !== undefined || patch.endHour !== undefined) &&
      !validateNoOverlap(allSessions, { startHour: nextStart, endHour: nextEnd }, session.id)
    ) {
      return;
    }
    try {
      await updateSession.mutateAsync({
        id: session.id,
        ...patch,
        ...(patch.name !== undefined ? { name: nextName } : {}),
      });
      if (patch.name !== undefined) setName(nextName);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update session");
    }
  }

  async function handleDelete() {
    try {
      await deleteSession.mutateAsync(session.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete session");
    }
  }

  function onDeleteClick() {
    if (loggedHourCount > 0) {
      setDeleteDialogOpen(true);
      return;
    }
    void handleDelete();
  }

  const deleteMessage =
    loggedHourCount === 1
      ? `This session has 1 logged hour. Deleting "${formatSessionName(session.name)}" will remove that hour from your timeline, including any notes, moods, and linked tasks.`
      : `This session has ${loggedHourCount} logged hours. Deleting "${formatSessionName(session.name)}" will remove them from your timeline, including any notes, moods, and linked tasks.`;

  return (
    <>
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`session-name-${session.id}`} className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id={`session-name-${session.id}`}
            value={name}
            autoFocus={autoFocus}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              const formatted = formatSessionName(name);
              if (formatted && formatted !== session.name) {
                setName(formatted);
                handleUpdate({ name: formatted });
              }
            }}
            disabled={busy}
            className="h-9 rounded-lg text-sm"
            placeholder="e.g. Deep work"
          />
        </div>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 size-9 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
            disabled={busy}
            onClick={onDeleteClick}
            aria-label="Delete session"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <SessionHourFields
        startHour={session.startHour}
        endHour={session.endHour}
        onStartChange={(h) => handleUpdate({ startHour: h })}
        onEndChange={(h) => handleUpdate({ endHour: h })}
        sessions={allSessions}
        excludeId={session.id}
        disabled={busy}
      />
    </div>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="rounded-xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete session?</AlertDialogTitle>
          <AlertDialogDescription>{deleteMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={busy}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            disabled={busy}
            onClick={() => void handleDelete()}
          >
            {deleteSession.isPending ? "Deleting…" : "Delete session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
