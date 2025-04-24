import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").default(0).notNull(),
  title: text("title").default("New Explorer").notNull(),
});

export const habitTypes = z.enum(["physical", "mental", "creative", "social"]);

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["physical", "mental", "creative", "social"] }).notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  streak: integer("streak").default(0).notNull(),
  totalDays: integer("total_days").default(0).notNull(),
  frequency: text("frequency", { enum: ["daily", "weekdays", "weekly"] }).default("daily").notNull(),
});

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow().notNull(),
  completed: boolean("completed").default(true).notNull(),
});

// Title thresholds
export const TITLE_THRESHOLDS = {
  "New Explorer": 0,
  "Habit Scout": 50,
  "Consistency Captain": 100,
  "Rhythm Master": 200,
  "Momentum Hero": 400,
  "Zen Legend": 700,
};

// Points
export const POINTS = {
  COMPLETION: 10,
  STREAK_BONUS: 5,
  DELETION_PENALTY: -10
};

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  type: true,
  userId: true,
  frequency: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  habitId: true,
  userId: true,
  completed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;

export type HabitType = z.infer<typeof habitTypes>;
export type Title = keyof typeof TITLE_THRESHOLDS;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  checkIns: many(checkIns),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  checkIns: many(checkIns),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  habit: one(habits, {
    fields: [checkIns.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
}));
