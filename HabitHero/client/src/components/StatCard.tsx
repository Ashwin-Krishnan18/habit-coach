import React from "react";
import { GradientCard } from "@/components/ui/gradient-card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string | React.ReactNode;
  icon: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  textGradient?: boolean;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  gradientFrom,
  gradientTo,
  textGradient = false
}: StatCardProps) {
  return (
    <GradientCard
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
    >
      <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
      <div className="flex items-center">
        <div className="mr-3 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(90deg, ${gradientFrom || "var(--accent-purple)"}, ${gradientTo || "var(--accent-blue)"})`
          }}
        >
          {icon}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${textGradient ? "gradient-text-success" : "gradient-text"}`}>
            {value}
          </h2>
          {subtext && (
            <p className="text-sm text-gray-400">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </GradientCard>
  );
}
