import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gray" | "green" | "blue" | "yellow" | "red";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function Badge({ children, variant, className, onClick }: BadgeProps) {
  const variants = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700"
  };
  
  const baseClasses = "px-2 py-1 rounded text-xs font-medium";
  const variantClasses = variant ? variants[variant] : "";
  
  return (
    <span 
      className={cn(baseClasses, variantClasses, className)}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
