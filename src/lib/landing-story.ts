import type { ReactNode } from "react";

export type StoryVisual = "problem" | "planner" | "tracker" | "analytics" | "dashboard";

export type StoryStep = {
  id: string;
  chapter: string;
  title: string;
  hook: string;
  body: string;
  visual: StoryVisual;
};

/** Draft scroll-narrative copy — for a future pinned scroll section */
export const STORY_STEPS: StoryStep[] = [
  {
    id: "problem",
    chapter: "The feeling",
    title: "Where did my day go?",
    hook: "You close the laptop. The list is checked off. And still — something feels off.",
    body: "Memory lies. Todo apps show intentions, not the day you lived. DayMirror starts with an honest question.",
    visual: "problem",
  },
  {
    id: "plan",
    chapter: "Morning",
    title: "Set intentions, lightly",
    hook: "Plan your month. Pick today's tasks. No pressure — just a map.",
    body: "Drop tasks on the calendar with category colors. Open any day for a focused agenda before life takes over.",
    visual: "planner",
  },
  {
    id: "track",
    chapter: "Through the day",
    title: "Reflect every hour",
    hook: "As each hour passes, log what actually happened.",
    body: "Mood, notes, linked tasks, productivity — your colored timeline is the truth, not the plan.",
    visual: "tracker",
  },
  {
    id: "understand",
    chapter: "Evening",
    title: "Run your time audit",
    hook: "Compare what you planned with what you lived.",
    body: "The ledger shows patterns — where focus held, where time drifted. Awareness without guilt.",
    visual: "analytics",
  },
  {
    id: "improve",
    chapter: "Tomorrow",
    title: "Build better days",
    hook: "Small insights compound. Tomorrow starts clearer.",
    body: "Planner, tracker, and analytics in one calm shell. Reflect. Understand. Improve.",
    visual: "dashboard",
  },
];

/** Draft hero / closing lines from scroll-story iteration */
export const DRAFT_LANDING_COPY = {
  heroSubhead:
    "Most productivity apps help you plan your day. DayMirror helps you understand the day you actually lived.",
  scrollHint: "Scroll to walk through a day with DayMirror",
  closingHeadline: "See where your day actually went.",
  closingSubhead: "Close the gap between planning and reality — one hour at a time.",
  finalCtaHeadline: "Your next day starts with honesty",
  finalCtaSubhead: "Reflect. Understand. Improve. Free to start.",
} as const;

export type StoryPreviewMap = Record<StoryVisual, ReactNode>;
