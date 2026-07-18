import { AnalyticsLedger } from "@/components/analytics/analytics-ledger";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Charts and historical ledger for retrospective productivity review.
        </p>
      </div>
      <AnalyticsLedger />
    </div>
  );
}
