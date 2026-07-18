import type { HourMood } from "@/types/api";

/** Default on-track % when Moderate is selected (user can fine-tune via slider). */
export const MODERATE_XP_DEFAULT = 50;

/** Fixed XP scores for mood — motivation + analytics consistency. */
export const MOOD_XP_SCORE: Record<HourMood, number> = {
  success: 100,
  moderate: MODERATE_XP_DEFAULT,
  wasted: 15,
  in_progress: 80,
  planning: 75,
};

/** Display/summary XP: fixed per mood, except Moderate uses stored slider value. */
export function resolveHourXp(mood: HourMood | null, productivity: number): number | null {
  if (!mood) return null;
  if (mood === "moderate") return productivity;
  return MOOD_XP_SCORE[mood];
}

export function xpForMoodSelection(mood: HourMood): number {
  return MOOD_XP_SCORE[mood];
}

type UpsertXpInput = {
  mood?: HourMood | null;
  productivity?: number;
};

type UpsertXpExisting = {
  mood: HourMood | null;
  productivity: number;
};

/** Normalize productivity before persisting an hour log. */
export function resolveUpsertProductivity(
  input: UpsertXpInput,
  existing?: UpsertXpExisting | null,
): number {
  if (input.mood !== undefined && input.mood !== null && input.mood !== "moderate") {
    return MOOD_XP_SCORE[input.mood];
  }

  if (input.productivity !== undefined) {
    return input.productivity;
  }

  if (input.mood === "moderate") {
    return existing?.mood === "moderate" ? existing.productivity : MODERATE_XP_DEFAULT;
  }

  return existing?.productivity ?? MODERATE_XP_DEFAULT;
}
