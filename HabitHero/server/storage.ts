import { 
  habits, users, checkIns, 
  type User, type InsertUser, 
  type Habit, type InsertHabit,
  type CheckIn, type InsertCheckIn,
  TITLE_THRESHOLDS, POINTS
} from "@shared/schema";
import { format, startOfDay, isSameDay, subDays } from "date-fns";

import { Store } from 'express-session';

// Modify the interface with CRUD methods
export interface IStorage {
  // Session store for authentication
  sessionStore: Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, pointsChange: number): Promise<User>;
  
  // Habit methods
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  getHabitById(id: number): Promise<Habit | undefined>;
  updateHabitStreak(id: number, streak: number): Promise<Habit>;
  updateHabitTotalDays(id: number, totalDays: number): Promise<Habit>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Check-in methods
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getCheckInsByHabitId(habitId: number): Promise<CheckIn[]>;
  getCheckInsByUserId(userId: number): Promise<CheckIn[]>;
  getCheckInsByDate(userId: number, date: Date): Promise<CheckIn[]>;
  hasCheckedInToday(habitId: number): Promise<boolean>;
}

import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { eq, and, gte, lt } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Create session store with PostgreSQL
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPoints(id: number, pointsChange: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update points
    const newPoints = Math.max(0, user.points + pointsChange);
    
    // Update title based on points
    let newTitle = user.title;
    for (const [title, threshold] of Object.entries(TITLE_THRESHOLDS)) {
      if (newPoints >= threshold) {
        newTitle = title;
      }
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        points: newPoints, 
        title: newTitle 
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Habit methods
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values(habit)
      .returning();
    
    return newHabit;
  }

  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    // Get all habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId));
    
    // Check which habits are completed today
    const habitsWithCompletion = await Promise.all(
      userHabits.map(async (habit) => {
        const completedToday = await this.hasCheckedInToday(habit.id);
        return { ...habit, completedToday };
      })
    );
    
    return habitsWithCompletion as any;
  }

  async getHabitById(id: number): Promise<Habit | undefined> {
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id));
    
    return habit;
  }

  async updateHabitStreak(id: number, streak: number): Promise<Habit> {
    const [updatedHabit] = await db
      .update(habits)
      .set({ streak })
      .where(eq(habits.id, id))
      .returning();
    
    return updatedHabit;
  }

  async updateHabitTotalDays(id: number, totalDays: number): Promise<Habit> {
    const [updatedHabit] = await db
      .update(habits)
      .set({ totalDays })
      .where(eq(habits.id, id))
      .returning();
    
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await db
      .delete(habits)
      .where(eq(habits.id, id))
      .returning({ id: habits.id });
    
    return result.length > 0;
  }

  // Check-in methods
  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [newCheckIn] = await db
      .insert(checkIns)
      .values(checkIn)
      .returning();
    
    // Update habit streak and totalDays
    const habit = await this.getHabitById(newCheckIn.habitId);
    if (habit) {
      // Only update if completion is true
      if (newCheckIn.completed) {
        const newStreak = habit.streak + 1;
        const newTotalDays = habit.totalDays + 1;
        
        await this.updateHabitStreak(habit.id, newStreak);
        await this.updateHabitTotalDays(habit.id, newTotalDays);
        
        // Add points for completion
        await this.updateUserPoints(newCheckIn.userId, POINTS.COMPLETION);
        
        // Add bonus points for streak milestones (every 5 days)
        if (newStreak % 5 === 0) {
          await this.updateUserPoints(newCheckIn.userId, POINTS.STREAK_BONUS);
        }
      }
    }
    
    return newCheckIn;
  }

  async getCheckInsByHabitId(habitId: number): Promise<CheckIn[]> {
    return db
      .select()
      .from(checkIns)
      .where(eq(checkIns.habitId, habitId));
  }

  async getCheckInsByUserId(userId: number): Promise<CheckIn[]> {
    console.log('Fetching check-ins for user:', userId);
    const checkIns = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId));
    console.log('Found check-ins:', checkIns);
    return checkIns;
  }

  async getCheckInsByDate(userId: number, date: Date): Promise<CheckIn[]> {
    const targetDate = startOfDay(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);
    
    return db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          gte(checkIns.date, targetDate),
          lt(checkIns.date, nextDate)
        )
      );
  }

  async hasCheckedInToday(habitId: number): Promise<boolean> {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todayCheckIns = await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.habitId, habitId),
          gte(checkIns.date, today),
          lt(checkIns.date, tomorrow),
          eq(checkIns.completed, true)
        )
      );
    
    return todayCheckIns.length > 0;
  }
}

export const storage = new DatabaseStorage();
