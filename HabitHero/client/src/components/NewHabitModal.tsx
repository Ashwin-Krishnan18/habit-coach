import React, { useState } from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientButton } from "@/components/ui/gradient-button";
import { XIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QueryClient } from "@tanstack/react-query";

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  queryClient: QueryClient;
}

export default function NewHabitModal({ 
  isOpen, 
  onClose,
  userId,
  queryClient 
}: NewHabitModalProps) {
  const { toast } = useToast();
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>("daily");
  
  if (!isOpen) return null;
  
  const handleCreateHabit = async () => {
    if (!habitName) {
      toast({
        title: "Error",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!habitType) {
      toast({
        title: "Error",
        description: "Please select a habit type.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/habits", {
        name: habitName,
        type: habitType,
        userId,
        frequency: frequency || "daily"
      });
      
      // Invalidate the habits query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/habits/user/${userId}`] });
      
      // Reset form and close modal
      setHabitName("");
      setHabitType(null);
      setFrequency("daily");
      onClose();
      
      toast({
        title: "Success",
        description: "Habit created successfully!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center">
      <Glassmorphism className="rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold gradient-text">Add New Habit</h3>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div>
          <div className="mb-4">
            <label htmlFor="habitName" className="block text-sm font-medium text-gray-400 mb-1">
              Habit Name
            </label>
            <input 
              type="text" 
              id="habitName" 
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full p-3 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-purple" 
              placeholder="e.g., Morning Run, Read 20 pages..."
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Habit Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["physical", "mental", "creative", "social"].map(type => (
                <button 
                  key={type}
                  type="button" 
                  onClick={() => setHabitType(type)}
                  className={`p-3 border rounded-lg text-center text-sm transition-colors type-selection-item ${
                    habitType === type 
                      ? "border-accent-purple bg-dark-600 selected" 
                      : "bg-dark-700 border-dark-500 hover:border-accent-purple"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {type === "physical" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {type === "mental" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {type === "creative" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
                      {type === "social" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="capitalize">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              How often?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["daily", "weekdays", "weekly"].map(freq => (
                <button 
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`p-3 border rounded-lg text-center text-sm transition-colors type-selection-item ${
                    frequency === freq 
                      ? "border-accent-purple bg-dark-600 selected" 
                      : "bg-dark-700 border-dark-500 hover:border-accent-purple"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {freq === "daily" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {freq === "weekdays" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {freq === "weekly" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    </div>
                    <span className="capitalize">{freq}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <GradientButton 
            className="w-full px-4 py-3"
            onClick={handleCreateHabit}
          >
            Create Habit
          </GradientButton>
        </div>
      </Glassmorphism>
    </div>
  );
}
