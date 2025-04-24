import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertHabitSchema, 
  insertCheckInSchema,
  POINTS
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Setup authentication
  setupAuth(app);

  // Habit routes
  apiRouter.post("/habits", async (req: Request, res: Response) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const newHabit = await storage.createHabit(habitData);
      return res.status(201).json(newHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/habits/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const habits = await storage.getHabitsByUserId(userId);
      
      // For each habit, check if it has been completed today
      const habitsWithStatus = await Promise.all(habits.map(async (habit) => {
        const completedToday = await storage.hasCheckedInToday(habit.id);
        return {
          ...habit,
          completedToday
        };
      }));
      
      return res.status(200).json(habitsWithStatus);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/habits/:id", async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(habitId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid habit or user ID" });
      }
      
      const habit = await storage.getHabitById(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this habit" });
      }
      
      // Delete the habit
      const deleted = await storage.deleteHabit(habitId);
      
      if (deleted) {
        // Apply point penalty for deleting a habit
        const updatedUser = await storage.updateUserPoints(userId, POINTS.DELETION_PENALTY);
        
        return res.status(200).json({ 
          message: "Habit deleted successfully",
          user: {
            points: updatedUser.points,
            title: updatedUser.title
          }
        });
      } else {
        return res.status(500).json({ message: "Failed to delete habit" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check-in routes
  apiRouter.post("/checkins", async (req: Request, res: Response) => {
    try {
      const checkInData = insertCheckInSchema.parse(req.body);
      
      // Check if already checked in today
      const alreadyCheckedIn = await storage.hasCheckedInToday(checkInData.habitId);
      
      if (alreadyCheckedIn) {
        return res.status(400).json({ message: "Already checked in for this habit today" });
      }
      
      const habit = await storage.getHabitById(checkInData.habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      const newCheckIn = await storage.createCheckIn(checkInData);
      
      // Get updated user data
      const user = await storage.getUser(checkInData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate points to next title
      let pointsToNextTitle = 0;
      let nextTitle = "";
      
      const titles = Object.entries({
        "New Explorer": 0,
        "Habit Scout": 50,
        "Consistency Captain": 100,
        "Rhythm Master": 200,
        "Momentum Hero": 400,
        "Zen Legend": 700,
      }).sort((a, b) => a[1] - b[1]);
      
      for (let i = 0; i < titles.length; i++) {
        const [title, threshold] = titles[i];
        if (user.points < threshold) {
          nextTitle = title;
          pointsToNextTitle = threshold - user.points;
          break;
        }
      }
      
      // If we didn't find a next title, user is at max level
      if (!nextTitle && titles.length > 0) {
        const maxTitle = titles[titles.length - 1][0];
        nextTitle = maxTitle;
        pointsToNextTitle = 0;
      }
      
      // Get updated habit
      const updatedHabit = await storage.getHabitById(checkInData.habitId);
      
      return res.status(201).json({
        checkIn: newCheckIn,
        user: {
          points: user.points,
          title: user.title,
          nextTitle,
          pointsToNextTitle
        },
        habit: updatedHabit
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/checkins/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const checkIns = await storage.getCheckInsByUserId(userId);
      console.log('Retrieved check-ins for user', userId, ':', checkIns);
      return res.status(200).json(checkIns);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/checkins/habit/:habitId", async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.habitId);
      
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const checkIns = await storage.getCheckInsByHabitId(habitId);
      return res.status(200).json(checkIns);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate points to next title
      let pointsToNextTitle = 0;
      let nextTitle = "";
      
      const titles = Object.entries({
        "New Explorer": 0,
        "Habit Scout": 50,
        "Consistency Captain": 100,
        "Rhythm Master": 200,
        "Momentum Hero": 400,
        "Zen Legend": 700,
      }).sort((a, b) => a[1] - b[1]);
      
      for (let i = 0; i < titles.length; i++) {
        const [title, threshold] = titles[i];
        if (user.points < threshold) {
          nextTitle = title;
          pointsToNextTitle = threshold - user.points;
          break;
        }
      }
      
      // If we didn't find a next title, user is at max level
      if (!nextTitle && titles.length > 0) {
        const maxTitle = titles[titles.length - 1][0];
        nextTitle = maxTitle;
        pointsToNextTitle = 0;
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        points: user.points,
        title: user.title,
        nextTitle,
        pointsToNextTitle
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
