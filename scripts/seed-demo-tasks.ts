/**
 * Seeds demo tasks for local QA: habits + a 30-day JS interview plan.
 *
 * Usage:
 *   yarn db:seed
 *   SEED_USER_ID=<uuid> yarn db:seed
 *   SEED_USER_EMAIL=user@example.com yarn db:seed
 *
 * Defaults to DEV_USER_ID / first user in the DB.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq, like } from "drizzle-orm";
import * as schema from "../src/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const DEV_USER_ID = process.env.SEED_USER_ID ?? process.env.DEV_USER_ID ?? "00000000-0000-0000-0000-000000000001";
const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL?.trim().toLowerCase();

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function atLocal(date: Date, hour: number, minute = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
}

const JS_INTERVIEW_DAYS: { title: string; notes: string; category: string }[] = [
  { title: "JS fundamentals: types & coercion", notes: "Read MDN types; write 10 typeof / == vs === quiz answers.", category: "learning" },
  { title: "Closures & scope", notes: "Explain lexical scope; implement once() and memoize().", category: "learning" },
  { title: "this / call / apply / bind", notes: "Predict this in 8 snippets; rewrite with arrow vs function.", category: "learning" },
  { title: "Prototypes & classes", notes: "Draw prototype chain; implement a tiny EventEmitter class.", category: "learning" },
  { title: "Arrays: map/filter/reduce", notes: "Solve 5 array problems without looking up methods first.", category: "learning" },
  { title: "Objects & immutability", notes: "Deep clone pitfalls; Object.assign vs spread; structuredClone.", category: "learning" },
  { title: "ES modules & bundling basics", notes: "Explain import/export; tree-shaking; CJS vs ESM.", category: "learning" },
  { title: "Async: callbacks → promises", notes: "Convert callback hell to promises; implement delay().", category: "learning" },
  { title: "async/await & error handling", notes: "Rewrite promise chains; practice try/catch patterns.", category: "learning" },
  { title: "Event loop deep dive", notes: "Microtasks vs macrotasks; predict output of 5 snippets.", category: "learning" },
  { title: "Fetch & HTTP basics", notes: "GET/POST with fetch; status codes; abort with AbortController.", category: "learning" },
  { title: "DOM & events", notes: "Delegation, bubbling, preventDefault; build a tiny todo UI.", category: "learning" },
  { title: "Storage & browser APIs", notes: "localStorage vs sessionStorage vs cookies; when to use each.", category: "learning" },
  { title: "Debounce & throttle", notes: "Implement both from scratch; attach to input + scroll.", category: "learning" },
  { title: "Data structures: Map/Set/WeakMap", notes: "Use cases; solve frequency-count + unique-paths style tasks.", category: "learning" },
  { title: "Algorithms: two pointers / sliding window", notes: "3 LeetCode easy/medium JS solutions.", category: "learning" },
  { title: "Algorithms: recursion & trees", notes: "DFS/BFS on a tree; flatten nested arrays.", category: "learning" },
  { title: "TypeScript essentials for interviews", notes: "interfaces vs types; generics; utility types pick/omit.", category: "learning" },
  { title: "React mental model", notes: "Render → commit; state vs props; keys; controlled inputs.", category: "learning" },
  { title: "React hooks interview set", notes: "useEffect deps, stale closures, custom hooks patterns.", category: "learning" },
  { title: "Performance: re-renders & memo", notes: "When memo/useMemo help; measure with React Profiler notes.", category: "learning" },
  { title: "Testing mindset", notes: "Write 3 unit tests (pure functions) with a simple assert helper.", category: "learning" },
  { title: "System design lite: frontend", notes: "Design a notification inbox UI + data flow on paper.", category: "learning" },
  { title: "Security basics", notes: "XSS, CSRF, open redirects; sanitize vs encode.", category: "learning" },
  { title: "Git & collaboration scenarios", notes: "rebase vs merge; conflict story; PR review checklist.", category: "other" },
  { title: "Behavioral stories (STAR)", notes: "Prepare 4 stories: conflict, failure, ownership, mentoring.", category: "other" },
  { title: "Mock interview: JS trivia", notes: "30 min rapid-fire; note weak spots for day 28 review.", category: "learning" },
  { title: "Mock interview: coding", notes: "45 min timed problem; speak aloud; refactor after.", category: "learning" },
  { title: "Weak-spot review day", notes: "Revisit notes from days 1–28; flashcards only.", category: "learning" },
  { title: "Final polish & rest", notes: "Light review, sleep early, prep questions for interviewer.", category: "health" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  const users = await db.select({ id: schema.user.id, email: schema.user.email, name: schema.user.name }).from(schema.user);
  let userId = DEV_USER_ID;

  if (SEED_USER_EMAIL) {
    const selectedUser = users.find((user) => user.email.toLowerCase() === SEED_USER_EMAIL);
    if (!selectedUser) {
      throw new Error(`No user found for SEED_USER_EMAIL=${SEED_USER_EMAIL}`);
    }
    userId = selectedUser.id;
    console.log(`Using SEED_USER_EMAIL=${selectedUser.email} (${userId})`);
  } else if (process.env.SEED_USER_ID) {
    userId = process.env.SEED_USER_ID;
    console.log(`Using SEED_USER_ID=${userId}`);
  } else if (users.length > 0) {
    userId = users[0].id;
    console.log(`Using first user: ${users[0].email} (${userId})`);
    if (users.length > 1) {
      console.log("Other users — re-run with SEED_USER_ID=<uuid>:");
      for (const u of users) console.log(`  ${u.id}  ${u.email}`);
    }
  } else {
    await db
      .insert(schema.user)
      .values({
        id: DEV_USER_ID,
        name: "Demo User",
        email: "demo@daymirror.local",
        emailVerified: true,
      })
      .onConflictDoNothing();
    console.log(`No users found — ensured demo user ${DEV_USER_ID}`);
  }

  // Remove previous seed rows for this user (idempotent re-seed)
  await db.delete(schema.tasks).where(and(eq(schema.tasks.userId, userId), like(schema.tasks.notes, "[seed]%")));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until26 = new Date(today.getFullYear(), 6, 26); // July 26 of current year (month is 0-indexed)
  // If July 26 already passed this year, use +30 days from today as habit until
  const habitUntil = until26 >= today ? until26 : addDays(today, 30);
  const planStart = today;
  const planEnd = addDays(planStart, 29);

  const habitUntilStr = formatDateOnly(habitUntil);
  const planStartStr = formatDateOnly(planStart);

  const rows: schema.NewTask[] = [
    {
      userId,
      title: "Drink water",
      notes: "[seed] Habit — quantity goal 8 glasses/day.",
      date: planStartStr,
      allDay: true,
      category: "health",
      color: "cyan",
      priority: "medium",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
      trackMode: "quantity",
      targetValue: 8,
      unit: "glasses",
      stepValue: 1,
    },
    {
      userId,
      title: "Push-ups",
      notes: "[seed] Habit — quantity goal 50 reps/day (step +5).",
      date: planStartStr,
      allDay: true,
      category: "health",
      color: "orange",
      priority: "medium",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
      trackMode: "quantity",
      targetValue: 50,
      unit: "reps",
      stepValue: 5,
    },
    {
      userId,
      title: "Deep work block",
      notes: "[seed] Timed recurring focus block (weekdays).",
      date: planStartStr,
      startAt: atLocal(planStart, 9, 0),
      endAt: atLocal(planStart, 11, 0),
      allDay: false,
      category: "work",
      color: "blue",
      priority: "high",
      recurrence: "weekdays",
      recurrenceUntil: habitUntilStr,
    },
    {
      userId,
      title: "Weekly review",
      notes: "[seed] Recurring weekly — review XP, habits, interview progress.",
      date: planStartStr,
      allDay: true,
      category: "other",
      color: "purple",
      priority: "low",
      recurrence: "weekly",
      recurrenceUntil: habitUntilStr,
    },
    {
      userId,
      title: "Read",
      notes: "[seed] Read for 30 minutes today (20 minutes already logged).",
      date: planStartStr,
      allDay: true,
      category: "learning",
      color: "purple",
      priority: "medium",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
      trackMode: "quantity",
      targetValue: 30,
      unit: "mins",
      stepValue: 5,
    },
    {
      userId,
      title: "Daily prayers",
      notes: "[seed] Complete 5 daily prayers.",
      date: planStartStr,
      allDay: true,
      category: "personal",
      color: "emerald",
      priority: "high",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
      trackMode: "quantity",
      targetValue: 5,
      unit: "times",
      stepValue: 1,
    },
    {
      userId,
      title: "Message potential clients",
      notes: "[seed] Outreach to 5 potential clients (2 already contacted).",
      date: planStartStr,
      allDay: true,
      category: "work",
      color: "blue",
      priority: "high",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
      trackMode: "quantity",
      targetValue: 5,
      unit: "times",
      stepValue: 1,
    },
    {
      userId,
      title: "Portfolio deep work",
      notes: "[seed] One focused hour improving a portfolio project.",
      date: planStartStr,
      startAt: atLocal(planStart, 14, 0),
      endAt: atLocal(planStart, 15, 0),
      allDay: false,
      category: "work",
      color: "indigo",
      priority: "high",
      recurrence: "weekdays",
      recurrenceUntil: habitUntilStr,
    },
    {
      userId,
      title: "Plan tomorrow",
      notes: "[seed] Pick tomorrow's top 3 priorities before ending the day.",
      date: planStartStr,
      startAt: atLocal(planStart, 16, 30),
      endAt: atLocal(planStart, 17, 0),
      allDay: false,
      category: "personal",
      color: "gray",
      priority: "medium",
      recurrence: "daily",
      recurrenceUntil: habitUntilStr,
    },
  ];

  for (let i = 0; i < JS_INTERVIEW_DAYS.length; i++) {
    const day = JS_INTERVIEW_DAYS[i];
    const d = addDays(planStart, i);
    rows.push({
      userId,
      title: `Day ${i + 1}: ${day.title}`,
      notes: `[seed] JS interview 30-day plan. ${day.notes}`,
      date: formatDateOnly(d),
      startAt: atLocal(d, i === 0 ? 9 : 10, 0),
      endAt: atLocal(d, 12, 0),
      allDay: false,
      category: day.category,
      color: "indigo",
      priority: i >= 26 ? "high" : "medium",
      recurrence: "none",
      recurrenceUntil: null,
    });
  }

  // One-off control sample outside the plan window
  rows.push({
    userId,
    title: "One-off: grocery run",
    notes: "[seed] Non-recurring control task.",
    date: formatDateOnly(addDays(planStart, 2)),
    allDay: true,
    category: "other",
    color: "gray",
    priority: "low",
    recurrence: "none",
  });

  const inserted = await db.insert(schema.tasks).values(rows).returning({
    id: schema.tasks.id,
    title: schema.tasks.title,
  });

  const initialProgress = new Map([
    ["Read", 20],
    ["Message potential clients", 2],
  ]);

  const progressRows = inserted.flatMap((task) => {
    const amount = initialProgress.get(task.title);
    return amount === undefined
      ? []
      : [{ userId, taskId: task.id, occurrenceDate: planStartStr, amount }];
  });

  if (progressRows.length > 0) {
    await db.insert(schema.taskProgress).values(progressRows);
  }

  await db
    .insert(schema.userSettings)
    .values({ userId, defaultStartHour: 9, defaultEndHour: 17 })
    .onConflictDoUpdate({
      target: schema.userSettings.userId,
      set: { defaultStartHour: 9, defaultEndHour: 17, updatedAt: new Date() },
    });

  const existingSessions = await db
    .select({ id: schema.trackerDaySessions.id, name: schema.trackerDaySessions.name })
    .from(schema.trackerDaySessions)
    .where(
      and(
        eq(schema.trackerDaySessions.userId, userId),
        eq(schema.trackerDaySessions.date, planStartStr),
      ),
    );

  if (existingSessions.length === 0) {
    await db.insert(schema.trackerDaySessions).values({
      userId,
      date: planStartStr,
      name: "My day",
      startHour: 9,
      endHour: 17,
      sortOrder: 0,
    });
  } else {
    const defaultSession = existingSessions.find((session) => session.name === "My day");
    if (defaultSession) {
      await db
        .update(schema.trackerDaySessions)
        .set({ startHour: 9, endHour: 17, updatedAt: new Date() })
        .where(eq(schema.trackerDaySessions.id, defaultSession.id));
    }
  }

  console.log(`Seeded ${rows.length} tasks for user ${userId}`);
  console.log(`  Habits until: ${habitUntilStr}`);
  console.log(`  JS interview plan: ${planStartStr} → ${formatDateOnly(planEnd)} (${JS_INTERVIEW_DAYS.length} days)`);
  console.log("Refresh Planner / Tracker to see them.");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
