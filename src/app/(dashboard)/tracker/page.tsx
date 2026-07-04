import { Suspense } from "react";
import { TrackerView } from "@/components/tracker/tracker-view";

export default function TrackerPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading tracker…</p>}>
      <TrackerView />
    </Suspense>
  );
}
