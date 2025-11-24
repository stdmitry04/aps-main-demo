'use client'

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type ToggleOption = {
    key: string;
    label: string;
};

interface ToggleSidebarProps {
    title?: string;
    options: ToggleOption[];
    selectedKey?: string;
    onSelect?: (key: string) => void;
    className?: string;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

const ChevronLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
);

const ClipboardIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TruckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export function ToggleSidebar({
    title = "Switch Method",
    options,
    selectedKey,
    onSelect,
    className,
    collapsed = false,
    onToggleCollapse
}: ToggleSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    return (
        <aside
            className={cn(
                "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-32" : "w-64",
                className
            )}
            aria-label={title}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-500">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            SD
                        </div>
                        <button
                            onClick={onToggleCollapse}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    SD
                                </div>
                                <div className="transition-opacity duration-200 delay-150">
                                    <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">School Demo District</h2>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">Human Resources</p>
                                </div>
                            </div>
                            <button
                                onClick={onToggleCollapse}
                                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                aria-label="Collapse sidebar"
                            >
                                <ChevronLeftIcon />
                            </button>
                        </div>
                        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide whitespace-nowrap transition-opacity duration-200 delay-150">{title}</h3>
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2" role="tablist" aria-orientation="vertical">
                {options.map((option) => {
                    const isActive = option.key === selectedKey;
                    const getIcon = (key: string) => {
                        if (key === "hr") return <ClipboardIcon />;
                        if (key === "time") return <CalendarIcon />;
                        if (key === "fleet") return <TruckIcon />;
                        if (key === "groups") return <UsersIcon />;
                        return null;
                    };

                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onSelect && onSelect(option.key)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-700 hover:bg-gray-50 border border-transparent"
                            )}
                            title={isCollapsed ? option.label : undefined}
                        >
                            {isCollapsed ? (
                                <div className="flex justify-center">
                                    {getIcon(option.key)}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                        {getIcon(option.key)}
                                    </div>
                                    <span className="whitespace-nowrap transition-opacity duration-200 delay-150">
                                        {option.label}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

export type { ToggleOption };
