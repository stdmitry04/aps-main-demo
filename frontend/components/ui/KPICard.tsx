import React from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  color?: "default" | "green" | "yellow" | "red";
  className?: string;
  subtitle?: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "success" | "warning" | "danger" | "default";
}

export function KPICard({ 
  title, 
  value, 
  color, 
  className, 
  subtitle, 
  description, 
  trend, 
  variant 
}: KPICardProps) {
  // Use variant if provided, otherwise fall back to color
  const effectiveColor = variant 
    ? (variant === "success" ? "green" : variant === "warning" ? "yellow" : variant === "danger" ? "red" : "default")
    : (color || "default");

  const colorClasses = {
    default: "text-gray-900",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600"
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→"
  };

  return (
    <div className={cn("bg-white rounded-lg shadow p-4", className)}>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className={cn("text-3xl font-bold", colorClasses[effectiveColor])}>
        {value}
        {trend && (
          <span className={cn(
            "ml-2 text-lg",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-gray-400"
          )}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
      )}
      {description && (
        <div className="text-xs text-gray-500 mt-2">{description}</div>
      )}
    </div>
  );
}
