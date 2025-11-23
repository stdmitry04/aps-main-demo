import React from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "blue" | "green" | "gray";
  className?: string;
}

export function ToggleButton({ 
  isActive, 
  onClick, 
  children, 
  variant = "blue",
  className 
}: ToggleButtonProps) {
  const variantClasses = {
    blue: isActive 
      ? "bg-blue-100 text-blue-700" 
      : "bg-gray-100 text-gray-600",
    green: isActive 
      ? "bg-green-100 text-green-700" 
      : "bg-gray-100 text-gray-600",
    gray: isActive 
      ? "bg-gray-200 text-gray-800" 
      : "bg-gray-100 text-gray-600"
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded text-sm transition-colors",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </Button>
  );
}
