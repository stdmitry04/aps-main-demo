"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role";
import { useAuthViewModel } from "@/app/(modules)/auth/auth.viewmodel";

interface NavItemProps {
    children: React.ReactNode;
    active?: boolean;
    href: string;
}

function NavItem({ children, active, href }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-colors",
                active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
        >
            {children}
        </Link>
    );
}

interface NavigationProps {
    currentModule?: string;
}

export function Navigation({ currentModule = "hr" }: NavigationProps) {
    const pathname = usePathname();
    const { role } = useRole();
    const roleStr = String(role);
    const { user } = useAuthViewModel();

    const hrTabs = [
        { name: 'Positions', href: '/hiring/positions' },
        { name: 'Applicants', href: '/hiring/applicants' },
        { name: 'Interviews', href: '/hiring/interviews' },
        { name: 'Offers', href: '/hiring/offers' },
        { name: 'Onboarding', href: '/hiring/onboarding' },
        { name: 'Reports', href: '/hiring/reports' },
    ];

    const allTimeTabs = [
        { name: 'Timesheet', href: '/timeandattendance/timesheet' },
        { name: 'My Timesheets', href: '/timeandattendance/mytimesheets' },
        { name: 'Attendance', href: '/timeandattendance/attendance' },
        { name: 'Timesheet Review', href: '/timeandattendance/review' },
        { name: 'Time Off Requests', href: '/timeandattendance/timeoff' },
        { name: 'Admin', href: '/timeandattendance/admin' },
    ];

    const adminTabs = [
        { name: 'Group Management', href: '/groups' },
    ];

  const fleetTabs = [
    { name: 'Fleet Map', href: '/fleet/dashboard' },
    { name: 'Rosters', href: '/fleet/rosters' },
    { name: 'Preventive Alerts', href: '/fleet/alerts' },
    { name: 'Current Work Orders', href: '/fleet/workorders' },
    { name: 'Maintenance Schedule', href: '/fleet/maintenance' },
    { name: 'Inspection Reports', href: '/fleet/reports' },
    { name: 'Comprehensive Fleet Health', href: '/fleet/health' },
  ];

    // Filter Time & Attendance tabs based on role
    const timeTabs = (() => {
        // HR only sees Review and Time Off Requests
        if (roleStr === "hr") {
            return [
                { name: 'Timesheet Review', href: '/timeandattendance/review' },
                { name: 'Time Off Requests', href: '/timeandattendance/timeoff' }
            ];
        }

        // Admin sees all tabs
        if (roleStr === "admin") {
            return allTimeTabs;
        }

        // Regular users see all tabs except Review, Time Off Requests, and Admin
        return allTimeTabs.filter(t =>
            t.href !== '/timeandattendance/review' &&
            t.href !== '/timeandattendance/timeoff' &&
            t.href !== '/timeandattendance/admin'
        );
    })();

    // Only admin and hr can see HR tabs
    const canAccessHr = roleStr === "admin" || roleStr === "hr";
    console.log("Navigation Rendered - Role:", roleStr, "Current Module:", currentModule);
    const canAccessAdmin = roleStr === "admin";
    console.log("Can Access Admin Tabs:", canAccessAdmin);
    const canAccessFleet = roleStr === "admin" || roleStr === "transportation";

    const tabs = currentModule === "admin"
        ? (canAccessAdmin ? adminTabs : [])
        : currentModule === "hr"
            ? (canAccessHr ? hrTabs : [])
            : currentModule === "fleet" 
              ? (canAccessFleet ? fleetTabs : []) 
              : timeTabs;

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex gap-8">
                    {tabs.map(tab => (
                        <NavItem
                            key={tab.name}
                            active={pathname === tab.href || (tab.href === '/' && pathname === '/hiring/positions') || pathname.startsWith(tab.href)}
                            href={tab.href}
                        >
                            {tab.name}
                        </NavItem>
                    ))}
                </div>
            </div>
        </nav>
    );
}