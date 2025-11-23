import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', error, label, helperText, id, ...props }, ref) => {

        return (
            <div className="w-full">
                {label && (
                    <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                    </label>
                )}

                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
                        'placeholder:text-gray-500 focus:outline-none focus:ring-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        // Focus states with orange theme
                        'focus:border-accent-500 focus:ring-accent-500/20',
                        // Error states
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                {error && (
                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
