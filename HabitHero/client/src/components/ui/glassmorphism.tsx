import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassmorphismProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const Glassmorphism = React.forwardRef<HTMLDivElement, GlassmorphismProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glassmorphism",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Glassmorphism.displayName = "Glassmorphism";

export { Glassmorphism };
