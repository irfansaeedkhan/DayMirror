"use client";

import { cn } from "@/lib/utils";

export type StoryHour = {
  label: string;
  mood?: "success" | "moderate" | "wasted" | "in_progress" | "planning";
  text?: string;
  task?: string;
  productivity?: number;
  lit?: boolean;
};

const MOOD_STYLES = {
  success: { bg: "rgba(62, 207, 142, 0.15)", border: "rgba(62, 207, 142, 0.35)", text: "#6ee7b7", label: "Productive" },
  moderate: { bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.3)", text: "#fcd34d", label: "Moderate" },
  wasted: { bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.3)", text: "#fca5a5", label: "Wasted" },
  in_progress: { bg: "rgba(91, 141, 239, 0.15)", border: "rgba(91, 141, 239, 0.4)", text: "#93b4ff", label: "In progress" },
  planning: { bg: "rgba(167, 139, 250, 0.12)", border: "rgba(167, 139, 250, 0.3)", text: "#c4b5fd", label: "Planning" },
};

type StoryTimelineProps = {
  hours: StoryHour[];
  filledCount?: number;
  glowIndex?: number;
  compact?: boolean;
  className?: string;
  animateFill?: boolean;
};

export function StoryTimeline({
  hours,
  filledCount,
  glowIndex,
  compact = false,
  className,
  animateFill = false,
}: StoryTimelineProps) {
  const limit = filledCount ?? hours.length;

  return (
    <div className={cn("story-timeline", compact && "story-timeline-compact", className)} aria-hidden>
      <div className="story-timeline-rail" />
      <div className="space-y-3">
        {hours.map((hour, i) => {
          const visible = i < limit;
          const mood = hour.mood ? MOOD_STYLES[hour.mood] : null;
          const glowing = glowIndex === i;

          return (
            <div
              key={`${hour.label}-${i}`}
              className={cn(
                "story-timeline-row",
                visible && "story-timeline-row-visible",
                animateFill && visible && "story-timeline-row-fill",
                glowing && "story-timeline-row-glow",
              )}
              style={{ animationDelay: animateFill ? `${i * 0.18}s` : undefined }}
            >
              <div className="story-timeline-dot-wrap">
                <span className={cn("story-timeline-dot", visible && mood && "story-timeline-dot-lit")} />
              </div>
              <span className="story-timeline-time">{hour.label}</span>
              <div
                className={cn(
                  "story-timeline-card",
                  visible && mood && "story-timeline-card-lit",
                  !visible && "story-timeline-card-empty",
                )}
                style={
                  visible && mood
                    ? {
                        background: mood.bg,
                        borderColor: mood.border,
                        boxShadow: glowing ? `0 0 32px ${mood.border}` : undefined,
                      }
                    : undefined
                }
              >
                {visible && mood ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ color: mood.text, background: `${mood.border}33` }}
                      >
                        {mood.label}
                      </span>
                      {hour.task ? (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                          {hour.task}
                        </span>
                      ) : null}
                      {hour.productivity != null ? (
                        <span className="ml-auto text-[10px] tabular-nums text-white/50">{hour.productivity}%</span>
                      ) : null}
                    </div>
                    {hour.text ? <p className="mt-2 text-xs leading-relaxed text-white/75">{hour.text}</p> : null}
                  </>
                ) : (
                  <div className="h-8 rounded-lg bg-white/[0.02]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const STORY_HOURS: StoryHour[] = [
  { label: "9 AM", mood: "success", text: "Deep work on the thing that actually matters.", task: "Write chapter 1", productivity: 88 },
  { label: "10 AM", mood: "moderate", text: "Email catch-up. Necessary, but not the dream.", productivity: 55 },
  { label: "11 AM", mood: "in_progress", text: "Team sync + planning session.", task: "Sprint review", productivity: 72 },
  { label: "12 PM", mood: "wasted", text: "One more video turned into forty-five minutes.", productivity: 18 },
  { label: "1 PM", mood: "planning", text: "Mapped tomorrow with intention.", productivity: 65 },
  { label: "2 PM", mood: "success", text: "Shipped the feature. Felt the momentum.", task: "Launch prep", productivity: 91 },
];
