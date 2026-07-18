"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOOD_CONFIG } from "@/lib/constants";
import { resolveHourXp } from "@/lib/hour-xp";
import type { AnalyticsRowDto } from "@/types/api";

function formatHour(h: number) {
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

export const analyticsColumns: ColumnDef<AnalyticsRowDto>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="cursor-pointer px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: "hour",
    header: "Hour",
    cell: ({ row }) => formatHour(row.getValue<number>("hour")),
  },
  {
    accessorKey: "description",
    header: "Notes",
    cell: ({ row }) => row.getValue<string | null>("description") ?? "—",
  },
  {
    accessorKey: "mood",
    header: "Status",
    cell: ({ row }) => {
      const mood = row.getValue<AnalyticsRowDto["mood"]>("mood");
      if (!mood) return "—";
      const cfg = MOOD_CONFIG[mood];
      return (
        <Badge
          variant="secondary"
          className="rounded-full border-transparent font-medium"
          style={{ background: cfg.muted, color: cfg.foreground }}
        >
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "productivity",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="cursor-pointer px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        XP
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const mood = row.original.mood;
      const xp = resolveHourXp(mood, row.getValue<number>("productivity"));
      return xp !== null ? `${xp}` : "—";
    },
  },
];
