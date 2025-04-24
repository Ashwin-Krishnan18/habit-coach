import React, { useState } from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useAuth } from "@/hooks/use-auth";
import { LogOutIcon } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  username: string;
  points: number;
  title: string;
}

export default function Header({ username, points, title }: HeaderProps) {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  
  // Get first letter of username for avatar
  const initial = username.charAt(0).toUpperCase();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      }
    });
  };
  
  return (
    <header className="sticky top-0 z-50">
      <Glassmorphism className="px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">Habit Coach</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center">
                <span className="font-semibold text-lg">{points}</span>
                <span className="ml-2 text-sm text-gray-400">points</span>
              </div>
              <div className="text-sm gradient-text font-medium">{title}</div>
            </div>
            
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 hover-glow"
                style={{
                  background: "linear-gradient(90deg, var(--accent-purple), var(--accent-blue))"
                }}
                onClick={() => setShowLogout(!showLogout)}
              >
                <span className="text-white font-bold">{initial}</span>
              </div>
              
              {showLogout && (
                <div className="absolute right-0 mt-2 glassmorphism rounded-lg shadow-xl w-36 overflow-hidden">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-dark-600 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="h-4 w-4 mr-2 text-accent-danger" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Glassmorphism>
    </header>
  );
}
