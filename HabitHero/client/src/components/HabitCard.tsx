import React, { useState } from "react";
import { GradientCard } from "@/components/ui/gradient-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Habit } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, CalendarIcon, Trash2Icon, AlertCircleIcon } from "lucide-react";

interface HabitCardProps {
  habit: Habit & { completedToday: boolean };
  userId: number;
  onDelete: (habitId: number) => void;
  onCheckin: (habitId: number) => void;
}

export default function HabitCard({ 
  habit, 
  userId,
  onDelete,
  onCheckin 
}: HabitCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  const handleCheckin = async () => {
    if (habit.completedToday) {
      toast({
        title: "Already completed",
        description: "You've already checked in this habit today.",
        variant: "default",
      });
      return;
    }
    
    setIsCheckingIn(true);
    try {
      onCheckin(habit.id);
      setIsCheckingIn(false);
    } catch (error) {
      setIsCheckingIn(false);
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleting(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/habits/${habit.id}?userId=${userId}`);
      onDelete(habit.id);
      setIsDeleting(false);
      
      toast({
        title: "Habit deleted",
        description: "The habit was successfully deleted",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Define the color mapping object with explicit type
  const habitTypeColors: Record<string, { from: string; to: string }> = {
    physical: { from: "var(--accent-purple)", to: "var(--accent-blue)" },
    mental: { from: "var(--accent-emerald)", to: "var(--accent-teal)" },
    creative: { from: "var(--accent-purple)", to: "var(--accent-blue)" },
    social: { from: "var(--accent-emerald)", to: "var(--accent-teal)" }
  };
  
  // Safe lookup with fallback
  const habitTypeColor = habitTypeColors[habit.type] || { from: "var(--accent-purple)", to: "var(--accent-blue)" };
  
  return (
    <GradientCard
      gradientFrom={habitTypeColor.from}
      gradientTo={habitTypeColor.to}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{habit.name}</h3>
        <span className="px-2 py-1 bg-dark-700 rounded-full text-xs font-medium badge">
          {habit.type}
        </span>
      </div>
      
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm mr-4">
          <span className="font-medium text-accent-success">{habit.streak}</span>
          <span className="text-gray-400"> day streak</span>
        </span>
        <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
        <span className="text-sm">
          <span className="font-medium">{habit.totalDays}</span>
          <span className="text-gray-400"> total days</span>
        </span>
      </div>
      
      <div className="flex justify-between">
        {!habit.completedToday ? (
          <GradientButton 
            variant="success" 
            onClick={handleCheckin}
            disabled={isCheckingIn}
            className="hover-lift"
          >
            {isCheckingIn ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Check-in
              </>
            )}
          </GradientButton>
        ) : (
          <div className="gradient-text-success font-medium flex items-center">
            <CheckIcon className="h-5 w-5 mr-2 text-accent-success" />
            Completed
          </div>
        )}
        <button 
          className="text-gray-400 hover:text-accent-danger transition-colors p-2 rounded-lg hover:bg-dark-700"
          onClick={handleDeleteClick}
          aria-label="Delete habit"
        >
          <Trash2Icon className="h-5 w-5" />
        </button>
      </div>
      
      {isDeleting && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center">
          <Glassmorphism className="rounded-xl p-6 max-w-md w-full mx-4 scale-in-animation">
            <div className="flex items-start mb-4">
              <div className="rounded-full bg-red-500/10 p-2 mr-3">
                <AlertCircleIcon className="h-6 w-6 text-accent-danger" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Delete Habit</h3>
                <p className="text-gray-300">
                  Are you sure you want to delete <span className="font-semibold">{habit.name}</span>? This will subtract 10 points from your total.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button 
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 transition-colors rounded-lg font-medium hover-lift"
                onClick={() => setIsDeleting(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-accent-danger hover:bg-red-600 transition-colors rounded-lg font-medium hover-lift"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </Glassmorphism>
        </div>
      )}
    </GradientCard>
  );
}
