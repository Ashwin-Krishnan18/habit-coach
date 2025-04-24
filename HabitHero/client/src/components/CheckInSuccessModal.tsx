import React from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientButton } from "@/components/ui/gradient-button";
import { XIcon } from "lucide-react";

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  points: number;
  title: string;
  pointsToNextTitle: number;
}

export default function CheckInSuccessModal({
  isOpen,
  onClose,
  habitName,
  points,
  title,
  pointsToNextTitle
}: CheckInSuccessModalProps) {
  if (!isOpen) return null;
  
  // Random tips for habits
  const tips = [
    "Pro tip: Morning habits are most effective before checking your phone.",
    "Try linking your new habit to an existing routine for better consistency.",
    "Even 2 minutes of a habit counts! Focus on consistency over perfection.",
    "Track your progress visually to stay motivated.",
    "Celebrate small wins to build momentum."
  ];
  
  // Get a random tip
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center">
      <Glassmorphism className="rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold gradient-text">Nice one!</h3>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-4">
          "{habitName}" checked off — you're stacking wins.
        </p>
        
        <div className="flex items-center mb-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
            style={{
              background: "linear-gradient(90deg, var(--accent-emerald), var(--accent-teal))"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xl font-bold gradient-text-success">+10 points</div>
        </div>
        
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <h4 className="text-xl font-bold gradient-text mb-1">Title: {title}</h4>
          <p className="text-sm text-gray-400">
            {pointsToNextTitle > 0
              ? `Next title in ${pointsToNextTitle} points`
              : "You've reached the highest title!"}
          </p>
        </div>
        
        <p className="text-gray-300 text-sm mb-6">
          {randomTip}
        </p>
        
        <GradientButton 
          className="w-full px-4 py-3"
          onClick={onClose}
        >
          Continue
        </GradientButton>
      </Glassmorphism>
    </div>
  );
}
