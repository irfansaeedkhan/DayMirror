/** All color values resolve via CSS variables in globals.css — do not hardcode hex/oklch here. */

export const CATEGORY_COLORS: Record<string, string> = {
  work: "var(--category-work)",
  personal: "var(--category-personal)",
  health: "var(--category-health)",
  learning: "var(--category-learning)",
  other: "var(--category-other)",
};

export const CATEGORY_LABELS: Record<string, string> = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  learning: "Learning",
  other: "Other",
};

/** Mood tokens — colors resolve via CSS variables in globals.css (light/dark). */
export const MOOD_CONFIG = {
  success: {
    label: "Success",
    color: "var(--mood-success)",
    muted: "var(--mood-success-muted)",
    foreground: "var(--mood-success-foreground)",
  },
  moderate: {
    label: "Moderate",
    color: "var(--mood-moderate)",
    muted: "var(--mood-moderate-muted)",
    foreground: "var(--mood-moderate-foreground)",
  },
  wasted: {
    label: "Wasted",
    color: "var(--mood-wasted)",
    muted: "var(--mood-wasted-muted)",
    foreground: "var(--mood-wasted-foreground)",
  },
  in_progress: {
    label: "In Progress",
    color: "var(--mood-in-progress)",
    muted: "var(--mood-in-progress-muted)",
    foreground: "var(--mood-in-progress-foreground)",
  },
  planning: {
    label: "Planning",
    color: "var(--mood-planning)",
    muted: "var(--mood-planning-muted)",
    foreground: "var(--mood-planning-foreground)",
  },
} as const;

export const MOOD_ON_SOLID = "var(--mood-on-solid)";

export const HOURS_IN_DAY = Array.from({ length: 24 }, (_, i) => i);

/** Auto-created when a day has no sessions yet. Calm default — user can rename. */
export const DEFAULT_SESSION_NAME = "My day";
