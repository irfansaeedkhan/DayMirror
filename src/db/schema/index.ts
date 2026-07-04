import { pgEnum, pgTable, uuid, text, date, timestamp, boolean, smallint, primaryKey, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);
export const taskRecurrenceEnum = pgEnum("task_recurrence", ["none", "daily", "weekdays", "weekly", "monthly"]);
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

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey(),
  theme: text("theme").notNull().default("system"),
  defaultStartHour: smallint("default_start_hour").notNull().default(1),
  defaultEndHour: smallint("default_end_hour").notNull().default(23),
  weekStartsOn: smallint("week_starts_on").notNull().default(0),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  completions: many(taskCompletions),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id] }),
  hourLogLinks: many(hourLogTasks),
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
export type HourLog = typeof hourLogs.$inferSelect;
export type NewHourLog = typeof hourLogs.$inferInsert;
export type HourLogTask = typeof hourLogTasks.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number];
export type TaskRecurrence = (typeof taskRecurrenceEnum.enumValues)[number];
export type HourMood = (typeof hourMoodEnum.enumValues)[number];

export * from "./auth";
