import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
   label?: string,
   placeholder?: string,
   value: string,
   onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
   error?: string;
}

export function Select({ children, className, ...props }: SelectProps) {
  return (
    <select 
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )} 
      {...props}
    >
      {children}
    </select>
  );
}
