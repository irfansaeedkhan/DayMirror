"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOOD_CONFIG } from "@/lib/constants";
import { resolveHourXp } from "@/lib/hour-xp";
import type { AnalyticsRowDto, HourMood } from "@/types/api";

const dayScoreChartConfig = {
  dayScore: {
    label: "Day score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const moodChartConfig = Object.fromEntries(
  Object.entries(MOOD_CONFIG).map(([key, cfg]) => [
    key,
    {
      label: cfg.label,
      color: cfg.color,
    },
  ]),
) satisfies ChartConfig;

type AnalyticsChartsProps = {
  rows: AnalyticsRowDto[];
};

export function AnalyticsCharts({ rows }: AnalyticsChartsProps) {
  const dayScoreByDate = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const row of rows) {
      const xp = resolveHourXp(row.mood, row.productivity);
      if (xp === null) continue;
      const current = map.get(row.date) ?? { total: 0, count: 0 };
      current.total += xp;
      current.count += 1;
      map.set(row.date, current);
    }

    return [...map.entries()]
      .map(([date, { total, count }]) => ({
        date,
        label: format(parseISO(date), "MMM d"),
        dayScore: Math.round(total / count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [rows]);

  const moodDistribution = useMemo(() => {
    const counts = new Map<HourMood, number>();
    for (const row of rows) {
      if (!row.mood) continue;
      counts.set(row.mood, (counts.get(row.mood) ?? 0) + 1);
    }
    return [...counts.entries()].map(([mood, count]) => ({
      mood,
      count,
      fill: `var(--color-${mood})`,
    }));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <p className="rounded-3xl bg-card p-6 text-sm text-muted-foreground shadow-elevated">
        Charts will appear once you log hours in the Tracker.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl border-0 bg-card shadow-elevated">
        <CardHeader>
          <CardTitle className="text-base">Daily score</CardTitle>
          <CardDescription>Average XP per mood-tagged day (last 14 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={dayScoreChartConfig} className="min-h-[220px] w-full">
            <BarChart accessibilityLayer data={dayScoreByDate}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="dayScore" fill="var(--color-dayScore)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-card shadow-elevated">
        <CardHeader>
          <CardTitle className="text-base">Mood mix</CardTitle>
          <CardDescription>How your logged hours break down by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={moodChartConfig} className="min-h-[220px] w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent nameKey="mood" />} />
              <Pie
                data={moodDistribution}
                dataKey="count"
                nameKey="mood"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {moodDistribution.map((entry) => (
                  <Cell key={entry.mood} fill={MOOD_CONFIG[entry.mood].color} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="mood" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
