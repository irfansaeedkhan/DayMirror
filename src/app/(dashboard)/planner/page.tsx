import { Suspense } from "react";
import { PlannerView } from "@/components/planner/planner-view";

export default function PlannerPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading planner…</p>}>
      <PlannerView />
    </Suspense>
  );
}
