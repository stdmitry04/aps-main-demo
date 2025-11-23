"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { ToggleSidebar } from "@/components/ui";
import { useRole } from "@/lib/role";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [method, setMethod] = React.useState<string>("hr");
    const { role } = useRole();
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
        // Initialize from localStorage, default to false (expanded) if not found
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarCollapsed");
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });
    const router = useRouter();
    const pathname = usePathname();

    // Save sidebar state to localStorage whenever it changes
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
        }
    }, [sidebarCollapsed]);

    // Sync module state with current route (but don't expand sidebar)
    React.useEffect(() => {
        if (pathname.startsWith("/timeandattendance")) {
            setMethod("time");
        } else if (pathname.startsWith("/hiring")) {
            setMethod("hr");
        } else if (pathname.startsWith("/fleet")) {
            setMethod("fleet");
        } else if (pathname.startsWith("/groups")) {
            setMethod(""); // Clear selection when on admin panel (groups)
        }
        // Note: We don't change sidebarCollapsed state here to keep it collapsed
    }, [pathname]);

    // Route guard: non-admin/non-hr cannot access HR module routes
    React.useEffect(() => {
        const isHrRoute = pathname.startsWith("/hiring");
        const canAccessHr = role === "admin" || role === "hr";
        if (isHrRoute && !canAccessHr) {
            router.replace("/timeandattendance/timesheet");
        }
    }, [pathname, role, router]);

    // Route guard: only admin can access Group Management
    React.useEffect(() => {
        const isGroupsRoute = pathname.startsWith("/groups");
        const isAdmin = role === "admin";
        if (isGroupsRoute && !isAdmin) {
            router.replace("/timeandattendance/timesheet");
        }
    }, [pathname, role, router]);

    // Route guard for Fleet: enforce per-role defaults
    React.useEffect(() => {
        const isFleetRoute = pathname.startsWith("/fleet");
        if (!isFleetRoute) return;


        const canAccessFleet = role === "admin" || role === "transportation";
        if (isFleetRoute && !canAccessFleet) {
            router.replace("/timeandattendance/timesheet");
        }
    }, [pathname, role, router]);

    // Route guard for Time & Attendance: enforce per-role defaults
    React.useEffect(() => {
        const isTaRoute = pathname.startsWith("/timeandattendance");
        if (!isTaRoute) return;

        const isReview = pathname.startsWith("/timeandattendance/review");
        const isTimeOff = pathname.startsWith("/timeandattendance/timeoff");
        const isOtherTa = isTaRoute && !isReview && !isTimeOff;
        const isHr = role === "hr";
        const isAdmin = role === "admin";

        // If HR role, only allow Review and Time Off; redirect other TA pages to Review
        if (isHr && isOtherTa) {
            router.replace("/timeandattendance/review");
            return;
        }

        // If not admin or HR, block Review and Time Off; redirect to Timesheet
        if (!isAdmin && !isHr && (isReview || isTimeOff)) {
            router.replace("/timeandattendance/timesheet");
            return;
        }
    }, [pathname, role, router]);

    const handleModuleChange = (newMethod: string) => {
        const canAccessHr = role === "admin" || role === "hr";

        if (newMethod === "hr" && !canAccessHr) {
            // Block switching to HR if not permitted
            setMethod("time");
            router.push("/timeandattendance/timesheet");
            return;
        }

        setMethod(newMethod);

        // Navigate to default page for the selected module
        if (newMethod === "hr") {
            router.push("/hiring/positions");
        } else if (newMethod === "time") {
            // If HR role, default to Review; otherwise to Timesheet
            const defaultTaPath = role === "hr" ? "/timeandattendance/review" : "/timeandattendance/timesheet";
            router.push(defaultTaPath);
        } else if (newMethod === "fleet") {
            router.push("/fleet/dashboard");
        }

    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* This is the toggle sidebar add new pages here and set the default page to the first page in the list */}
            <ToggleSidebar
                title="Modules"
                options={(() => {
                    const canAccessHr = role === "admin" || role === "hr";
                    const canAccessFleet = role === "admin" || role === "transportation";
                    const opts = [{ key: "time", label: "Time & Attendance" } as const];

                    // Build options array based on role permissions
                    const modules = [];
                    if (canAccessHr) {
                        modules.push({ key: "hr", label: "Hiring & Onboarding" });
                    }
                    if (canAccessFleet) {
                        modules.push({ key: "fleet", label: "Fleet Management" });
                    }
                    modules.push(...opts);

                    return modules;
                })()}
                selectedKey={method}
                onSelect={handleModuleChange}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex-1 flex flex-col">
                <Header />
                <Navigation currentModule={method} />
                <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
