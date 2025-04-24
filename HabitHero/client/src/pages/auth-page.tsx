import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { ZapIcon } from "lucide-react";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate(
        { username, password },
        {
          onSuccess: () => {
            navigate("/");
          },
        }
      );
    } else {
      registerMutation.mutate(
        { username, password },
        {
          onSuccess: () => {
            navigate("/");
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section - Form */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {isLogin ? "Welcome back" : "Join Habit Coach"}
          </h1>
          <p className="text-gray-400 mb-8">
            {isLogin
              ? "Log in to your account to continue your habit journey"
              : "Create an account to start building better habits"}
          </p>

          <Glassmorphism className="rounded-xl p-6 mb-6 auth-form hover-lift transition-transform duration-300">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 bg-dark-700 border border-dark-500 hover:border-accent-purple focus:border-accent-purple rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-dark-700 border border-dark-500 hover:border-accent-purple focus:border-accent-purple rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  placeholder="Enter your password"
                />
              </div>

              <GradientButton 
                type="submit" 
                className="w-full py-3 hover-glow transition-shadow duration-300"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {(loginMutation.isPending || registerMutation.isPending) ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  isLogin ? "Log In" : "Sign Up"
                )}
              </GradientButton>
            </form>
          </Glassmorphism>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-purple hover:text-accent-blue transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>

      {/* Right section - Hero */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-dark-900 to-dark-800 p-10 items-center justify-center">
        <div className="max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
              background: "linear-gradient(90deg, var(--accent-purple), var(--accent-blue))"
            }}>
              <ZapIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold gradient-text mb-4">Build Better Habits, Transform Your Life</h2>
          
          <p className="text-gray-300 mb-8">
            Habit Coach helps you build consistent routines with daily tracking, 
            achievement rewards, and personalized insights to help you stay motivated.
          </p>
          
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">7+</div>
              <div className="text-sm text-gray-400">Daily check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">28+</div>
              <div className="text-sm text-gray-400">Day streaks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">96%</div>
              <div className="text-sm text-gray-400">Retention rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}