import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  children: React.ReactNode;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({ className, gradientFrom, gradientTo, children, ...props }, ref) => {
    const defaultFrom = "var(--accent-purple)";
    const defaultTo = "var(--accent-blue)";
    
    const from = gradientFrom || defaultFrom;
    const to = gradientTo || defaultTo;
    
    return (
      <div
        ref={ref}
        className={cn(
          "glassmorphism rounded-xl p-6 habit-card relative overflow-hidden",
          className
        )}
        {...props}
      >
        <div 
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
          style={{
            background: `linear-gradient(90deg, ${from}, ${to})`
          }}
        />
        {children}
      </div>
    );
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard };
