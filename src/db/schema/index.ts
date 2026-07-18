import { pgEnum, pgTable, uuid, text, date, timestamp, boolean, smallint, primaryKey, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);
export const taskRecurrenceEnum = pgEnum("task_recurrence", ["none", "daily", "weekdays", "weekly", "monthly"]);
export const taskTrackModeEnum = pgEnum("task_track_mode", ["checkbox", "quantity"]);
export const hourMoodEnum = pgEnum("hour_mood", ["success", "moderate", "wasted", "in_progress", "planning"]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    notes: text("notes"),
    date: date("date").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }),
    endAt: timestamp("end_at", { withTimezone: true }),
    allDay: boolean("all_day").notNull().default(false),
    category: text("category").notNull().default("other"),
    color: text("color").notNull().default("blue"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    recurrence: taskRecurrenceEnum("recurrence").notNull().default("none"),
    recurrenceUntil: date("recurrence_until"),
    /** checkbox = done/not done; quantity = progress toward a numeric goal */
    trackMode: taskTrackModeEnum("track_mode").notNull().default("checkbox"),
    /** Target amount for quantity mode (e.g. 8 glasses, 50 reps). */
    targetValue: smallint("target_value"),
    /** Display unit: glasses, reps, mins, ml, pages, … */
    unit: text("unit"),
    /** Default increment when tapping + (e.g. 1 glass, 5 reps). */
    stepValue: smallint("step_value").notNull().default(1),
    parentTaskId: uuid("parent_task_id"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tasks_user_date_idx").on(t.userId, t.date),
  ],
);

export const taskCompletions = pgTable(
  "task_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    occurrenceDate: date("occurrence_date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("task_completions_task_occurrence").on(t.taskId, t.occurrenceDate)],
);

/** Running quantity toward a goal for one occurrence day. */
export const taskProgress = pgTable(
  "task_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    occurrenceDate: date("occurrence_date").notNull(),
    amount: smallint("amount").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("task_progress_task_occurrence").on(t.taskId, t.occurrenceDate),
    index("task_progress_user_date_idx").on(t.userId, t.occurrenceDate),
  ],
);

export const hourLogs = pgTable(
  "hour_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    hour: smallint("hour").notNull(),
    description: text("description"),
    mood: hourMoodEnum("mood"),
    productivity: smallint("productivity").notNull().default(50),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("hour_logs_user_date_idx").on(t.userId, t.date),
    unique("hour_logs_user_date_hour").on(t.userId, t.date, t.hour),
  ],
);

export const hourLogTasks = pgTable(
  "hour_log_tasks",
  {
    hourLogId: uuid("hour_log_id")
      .notNull()
      .references(() => hourLogs.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.hourLogId, t.taskId] })],
);

export const feedbackCategoryEnum = pgEnum("feedback_category", ["bug", "idea", "other"]);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    message: text("message").notNull(),
    rating: smallint("rating"),
    category: feedbackCategoryEnum("category").notNull().default("other"),
    page: text("page"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_user_created_idx").on(t.userId, t.createdAt)],
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey(),
  theme: text("theme").notNull().default("system"),
  defaultStartHour: smallint("default_start_hour").notNull().default(9),
  defaultEndHour: smallint("default_end_hour").notNull().default(17),
  weekStartsOn: smallint("week_starts_on").notNull().default(0),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trackerDayWindows = pgTable(
  "tracker_day_windows",
  {
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    startHour: smallint("start_hour").notNull(),
    endHour: smallint("end_hour").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.date] }),
    index("tracker_day_windows_user_date_idx").on(t.userId, t.date),
  ],
);

export const trackerDaySessions = pgTable(
  "tracker_day_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    name: text("name").notNull().default("Session"),
    startHour: smallint("start_hour").notNull(),
    endHour: smallint("end_hour").notNull(),
    sortOrder: smallint("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tracker_day_sessions_user_date_idx").on(t.userId, t.date)],
);

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  completions: many(taskCompletions),
  progress: many(taskProgress),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id] }),
  hourLogLinks: many(hourLogTasks),
}));

export const taskProgressRelations = relations(taskProgress, ({ one }) => ({
  task: one(tasks, { fields: [taskProgress.taskId], references: [tasks.id] }),
}));

export const hourLogsRelations = relations(hourLogs, ({ many }) => ({
  taskLinks: many(hourLogTasks),
}));

export const hourLogTasksRelations = relations(hourLogTasks, ({ one }) => ({
  hourLog: one(hourLogs, { fields: [hourLogTasks.hourLogId], references: [hourLogs.id] }),
  task: one(tasks, { fields: [hourLogTasks.taskId], references: [tasks.id] }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type TaskProgress = typeof taskProgress.$inferSelect;
export type NewTaskProgress = typeof taskProgress.$inferInsert;
export type TaskTrackMode = (typeof taskTrackModeEnum.enumValues)[number];
export type HourLog = typeof hourLogs.$inferSelect;
export type NewHourLog = typeof hourLogs.$inferInsert;
export type HourLogTask = typeof hourLogTasks.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type TrackerDayWindow = typeof trackerDayWindows.$inferSelect;
export type TrackerDaySession = typeof trackerDaySessions.$inferSelect;
export type NewTrackerDaySession = typeof trackerDaySessions.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type FeedbackCategory = (typeof feedbackCategoryEnum.enumValues)[number];
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number];
export type TaskRecurrence = (typeof taskRecurrenceEnum.enumValues)[number];
export type HourMood = (typeof hourMoodEnum.enumValues)[number];

export * from "./auth";
