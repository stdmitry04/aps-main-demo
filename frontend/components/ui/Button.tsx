import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "accent" | "success";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

const Spinner = () => (
    <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

export function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 disabled:bg-gray-50",
        ghost: "text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
        accent: "bg-accent-500 text-white hover:bg-accent-600 disabled:bg-accent-300 focus:ring-accent-500/20 focus:ring-2 focus:ring-offset-2",
        success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 focus:ring-green-500/20 focus:ring-2 focus:ring-offset-2"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const isDisabled = disabled || isLoading;

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
                "disabled:cursor-not-allowed focus:outline-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {isLoading && <Spinner />}
            {children}
        </button>
    );
}
