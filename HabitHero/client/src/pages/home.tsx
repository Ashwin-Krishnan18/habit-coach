import React, { useState } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import HabitCard from "@/components/HabitCard";
import Calendar from "@/components/Calendar";
import NewHabitModal from "@/components/NewHabitModal";
import CheckInSuccessModal from "@/components/CheckInSuccessModal";
import { GradientButton } from "@/components/ui/gradient-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { PlusIcon, CheckCircleIcon, ZapIcon, ClipboardListIcon } from "lucide-react";

// Define some interfaces to improve type safety
interface UserData {
  id: number;
  username: string;
  points: number;
  title: string;
  pointsToNextTitle: number;
}

interface HabitData {
  id: number;
  name: string;
  type: string;
  userId: number;
  streak: number;
  totalDays: number;
  completedToday: boolean;
}

interface CheckInData {
  habitId: number;
  userId: number;
  date: string;
  completed: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id || 1; // Fallback to 1 for safety
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for modals
  const [newHabitModalOpen, setNewHabitModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinData, setCheckinData] = useState({
    habitName: "",
    points: 0,
    title: "",
    pointsToNextTitle: 0
  });
  
  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<UserData>({
    queryKey: [`/api/user/${userId}`],
    refetchOnWindowFocus: false,
  });
  
  // Fetch habits
  const { data: habits, isLoading: habitsLoading } = useQuery<HabitData[]>({
    queryKey: [`/api/habits/user/${userId}`],
    refetchOnWindowFocus: false,
  });
  
  // Fetch check-ins
  const { data: checkIns, isLoading: checkInsLoading } = useQuery<CheckInData[]>({
    queryKey: [`/api/checkins/user/${userId}`],
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('Fetched check-ins:', data);
    }
  });
  
  // Mutation for check-ins
  const checkInMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const response = await apiRequest("POST", "/api/checkins", {
        habitId,
        userId,
        completed: true
      });
      return await response.json();
    },
    onSuccess: async (data: any) => {
      // Show success modal
      setCheckinData({
        habitName: data.habit.name,
        points: data.user.points,
        title: data.user.title,
        pointsToNextTitle: data.user.pointsToNextTitle
      });
      setCheckinModalOpen(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/habits/user/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/checkins/user/${userId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Type-safe access to the data
  const habitsArray = habits || [];
  const userDataSafe = userData || { 
    id: userId, 
    username: "User", 
    points: 0, 
    title: "New Explorer",
    pointsToNextTitle: 0
  };
  const checkInsArray = checkIns || [];
  
  // Calculate stats
  const activeHabits = habitsArray.length;
  const completedToday = habitsArray.filter(h => h.completedToday).length;
  
  // Find longest streak
  const getLongestStreak = () => {
    if (habitsArray.length === 0) return { streak: 0, name: "No habits yet" };
    
    return habitsArray.reduce((max, habit) => {
      return habit.streak > max.streak ? { streak: habit.streak, name: habit.name } : max;
    }, { streak: 0, name: "" });
  };
  
  const longestStreak = getLongestStreak();
  
  // Handle check-in
  const handleCheckin = (habitId: number) => {
    checkInMutation.mutate(habitId);
  };
  
  // Handle habit deletion
  const handleHabitDelete = () => {
    // Refresh data after deletion
    queryClient.invalidateQueries({ queryKey: [`/api/habits/user/${userId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/checkins/user/${userId}`] });
  };
  
  // Loading state
  if (userLoading || habitsLoading || checkInsLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        username={userDataSafe?.username || "User"} 
        points={userDataSafe?.points || 0} 
        title={userDataSafe?.title || "New Explorer"} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Dashboard Section */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Current Title"
              value={userDataSafe?.title || "New Explorer"}
              subtext={userDataSafe?.pointsToNextTitle > 0 ? `${userDataSafe?.pointsToNextTitle} points to next level` : "Max level reached!"}
              icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
              gradientFrom="var(--accent-purple)"
              gradientTo="var(--accent-blue)"
            />
            
            <StatCard
              title="Total Points"
              value={userDataSafe?.points || 0}
              subtext={<span><span className="text-accent-success">+10</span> per completion</span>}
              icon={<ZapIcon className="h-6 w-6 text-white" />}
              gradientFrom="var(--accent-emerald)"
              gradientTo="var(--accent-teal)"
              textGradient={true}
            />
            
            <StatCard
              title="Active Habits"
              value={activeHabits}
              subtext={<span><span className="text-accent-success">{completedToday}</span> completed today</span>}
              icon={<ClipboardListIcon className="h-6 w-6 text-white" />}
              gradientFrom="var(--accent-purple)"
              gradientTo="var(--accent-blue)"
            />
            
            <StatCard
              title="Longest Streak"
              value={longestStreak.streak}
              subtext={longestStreak.name}
              icon={<ZapIcon className="h-6 w-6 text-white" />}
              gradientFrom="var(--accent-emerald)"
              gradientTo="var(--accent-teal)"
              textGradient={true}
            />
          </div>
        </section>
        
        {/* Today's Habits Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Today's Habits</h2>
            <GradientButton onClick={() => setNewHabitModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Habit
            </GradientButton>
          </div>
          
          {habitsArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habitsArray.map((habit: any) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  userId={userId}
                  onDelete={handleHabitDelete}
                  onCheckin={handleCheckin}
                />
              ))}
            </div>
          ) : (
            <div className="glassmorphism rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold mb-4 gradient-text">No Habits Yet</h3>
              <p className="text-gray-400 mb-6">
                Start by creating your first habit to track. 
                Building consistent habits is the key to achieving your goals.
              </p>
              <GradientButton onClick={() => setNewHabitModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Habit
              </GradientButton>
            </div>
          )}
        </section>
        
        {/* Calendar Section */}
        <Calendar checkIns={checkInsArray} />
      </main>
      
      {/* Modals */}
      <NewHabitModal 
        isOpen={newHabitModalOpen}
        onClose={() => setNewHabitModalOpen(false)}
        userId={userId}
        queryClient={queryClient}
      />
      
      <CheckInSuccessModal 
        isOpen={checkinModalOpen}
        onClose={() => setCheckinModalOpen(false)}
        habitName={checkinData.habitName}
        points={checkinData.points}
        title={checkinData.title}
        pointsToNextTitle={checkinData.pointsToNextTitle}
      />
    </div>
  );
}
