import { AnalyticsLedger } from "@/components/analytics/analytics-ledger";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Historical ledger for retrospective productivity review.
        </p>
      </div>
      <AnalyticsLedger />
    </div>
  );
}
