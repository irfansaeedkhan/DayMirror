import type { ReactNode } from "react";
import {
  AnalyticsPreview,
  DashboardPreview,
  PlannerDayPreview,
  PlannerMonthPreview,
  TrackerPreview,
} from "@/components/landing/product-previews";
import { DRAFT_LANDING_COPY, STORY_STEPS } from "@/lib/landing-story";
import { cn } from "@/lib/utils";

function ProblemPreview() {
  return (
    <div className="flex min-h-[14rem] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center shadow-elevated">
      <p className="text-5xl font-semibold tracking-tight text-muted-foreground/40 lg:text-6xl">?</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        End of day. Tasks done. Still asking:{" "}
        <span className="text-foreground">where did it all go?</span>
      </p>
    </div>
  );
}

function StoryFeatureRow({
  chapter,
  title,
  hook,
  body,
  preview,
  reverse = false,
}: {
  chapter: string;
  title: string;
  hook: string;
  body: string;
  preview: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 border-t border-border/40 pt-12 first:border-0 first:pt-0 lg:grid-cols-2 lg:gap-16">
      <div className={cn("space-y-3", reverse && "lg:order-2")}>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {chapter}
        </p>
        <h3 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h3>
        <p className="text-base font-medium text-foreground/90">{hook}</p>
        <p className="text-muted-foreground">{body}</p>
      </div>
      <div className={cn(reverse && "lg:order-1")}>{preview}</div>
    </div>
  );
}

const VISUALS = {
  problem: <ProblemPreview />,
  planner: (
    <div className="space-y-4">
      <PlannerMonthPreview />
      <PlannerDayPreview />
    </div>
  ),
  tracker: <TrackerPreview />,
  analytics: <AnalyticsPreview />,
  dashboard: <DashboardPreview />,
} as const;

/** Draft sections — scroll-story copy kept for a future landing iteration */
export function StorySectionsDraft() {
  return (
    <>
      <section className="border-t border-dashed border-border/80 bg-muted/20 py-16 lg:py-20">
        <div className="app-container space-y-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Draft copy — work in progress
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">
              Alternative hero &amp; closing lines
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 text-sm">
            <div className="rounded-2xl bg-card p-5 shadow-elevated">
              <p className="font-medium text-muted-foreground">Hero subhead (alt)</p>
              <p className="mt-2">{DRAFT_LANDING_COPY.heroSubhead}</p>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-elevated">
              <p className="font-medium text-muted-foreground">Scroll hint</p>
              <p className="mt-2">{DRAFT_LANDING_COPY.scrollHint}</p>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-elevated">
              <p className="font-medium text-muted-foreground">Closing (alt)</p>
              <p className="mt-2 font-semibold">{DRAFT_LANDING_COPY.closingHeadline}</p>
              <p className="mt-1 text-muted-foreground">{DRAFT_LANDING_COPY.closingSubhead}</p>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-elevated">
              <p className="font-medium text-muted-foreground">Final CTA (alt)</p>
              <p className="mt-2 font-semibold">{DRAFT_LANDING_COPY.finalCtaHeadline}</p>
              <p className="mt-1 text-muted-foreground">{DRAFT_LANDING_COPY.finalCtaSubhead}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-dashed border-border/80 py-16 lg:py-20">
        <div className="app-container space-y-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Draft copy — work in progress
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
              Your day, in five beats
            </h2>
            <p className="mt-4 text-muted-foreground">
              Scroll-story narrative — intended for a pinned GSAP section later.
            </p>
          </div>

          {STORY_STEPS.map((step, i) => (
            <StoryFeatureRow
              key={step.id}
              chapter={step.chapter}
              title={step.title}
              hook={step.hook}
              body={step.body}
              preview={VISUALS[step.visual]}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}
