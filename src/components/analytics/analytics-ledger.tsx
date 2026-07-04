"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useAnalyticsLedger } from "@/hooks/use-analytics";
import { MOOD_CONFIG } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsRowDto } from "@/types/api";

const columnHelper = createColumnHelper<AnalyticsRowDto>();

function formatHour(h: number) {
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

const columns = [
  columnHelper.accessor("date", { header: "Date", cell: (info) => info.getValue() }),
  columnHelper.accessor("hour", {
    header: "Hour",
    cell: (info) => formatHour(info.getValue()),
  }),
  columnHelper.accessor("description", {
    header: "Notes",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("mood", {
    header: "Status",
    cell: (info) => {
      const mood = info.getValue();
      if (!mood) return "—";
      const cfg = MOOD_CONFIG[mood];
      return (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      );
    },
  }),
  columnHelper.accessor("productivity", {
    header: "Productivity",
    cell: (info) => `${info.getValue()}%`,
  }),
];

export function AnalyticsLedger() {
  const { data, isLoading } = useAnalyticsLedger();
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);

  const rows = useMemo(() => data?.rows ?? [], [data]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading ledger…</p>;
  }

  return (
    <div className="rounded-3xl bg-card shadow-elevated overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                No historical entries yet. Start logging hours in the Tracker.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
