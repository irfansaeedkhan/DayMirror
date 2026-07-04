export const CATEGORY_COLORS: Record<string, string> = {
  work: "oklch(0.62 0.19 255)",
  personal: "oklch(0.7 0.15 320)",
  health: "oklch(0.7 0.15 150)",
  learning: "oklch(0.74 0.16 55)",
  other: "oklch(0.6 0.04 260)",
};

export const CATEGORY_LABELS: Record<string, string> = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  learning: "Learning",
  other: "Other",
};

export const MOOD_CONFIG = {
  success: { label: "Success", color: "oklch(0.62 0.16 150)", bg: "oklch(0.92 0.08 150)" },
  moderate: { label: "Moderate", color: "oklch(0.65 0.16 75)", bg: "oklch(0.94 0.09 75)" },
  wasted: { label: "Wasted", color: "oklch(0.58 0.20 25)", bg: "oklch(0.93 0.07 25)" },
  in_progress: { label: "In Progress", color: "oklch(0.58 0.18 255)", bg: "oklch(0.93 0.06 255)" },
  planning: { label: "Planning", color: "oklch(0.60 0.16 320)", bg: "oklch(0.93 0.07 320)" },
} as const;

export const HOURS_IN_DAY = Array.from({ length: 24 }, (_, i) => i);
