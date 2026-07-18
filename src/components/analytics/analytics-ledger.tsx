"use client";

import { useMemo } from "react";
import { useAnalyticsLedger } from "@/hooks/use-analytics";
import { DataTable } from "@/components/ui/data-table";
import { analyticsColumns } from "@/components/analytics/analytics-columns";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

export function AnalyticsLedger() {
  const { data, isLoading } = useAnalyticsLedger();
  const rows = useMemo(() => data?.rows ?? [], [data]);

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading analytics…</p>;
  }

  return (
    <div className="space-y-6">
      <AnalyticsCharts rows={rows} />
      <DataTable
        columns={analyticsColumns}
        data={rows}
        pageSize={10}
        initialSorting={[{ id: "date", desc: true }]}
        emptyMessage="No historical entries yet. Start logging hours in the Tracker."
      />
    </div>
  );
}
