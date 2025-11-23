"use client";

import React from "react";
import api from "./api";
import { User } from "@/types/user.types";

export type AppRole = "hr" | "admin" | "general_staff" | "candidate" | "transportation" | "student" | "teacher";

const ROLE_STORAGE_KEY = "currentRole";

export interface RoleContextValue {
    role: AppRole;
    setRole: (nextRole: AppRole) => void;
    roles: { value: AppRole; label: string }[];
    isLoading: boolean;
}

const defaultRoles: { value: AppRole; label: string }[] = [
    { value: "hr", label: "HR" },
    { value: "admin", label: "Admin" },
    { value: "general_staff", label: "General Staff" },
    { value: "candidate", label: "Candidate" },
    { value: "transportation", label: "Transportation" },
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher" },
];

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = React.useState<AppRole>("general_staff");
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    // Fetch user profile and set role on mount
    React.useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const response = await api.get<User>("/auth/profile/");
                const user = response.data;

                // Use the role from the user profile
                // If user has canEditGroupMappings, treat them as admin
                console.log("Fetched user profile for role determination:", user);
                if (user.role) {
                    const effectiveRole = user.canEditGroupMappings ? "admin" : user.role;
                    console.log("Determined effective role:", effectiveRole);
                    setRoleState(effectiveRole);
                    // Store in localStorage for persistence
                    localStorage.setItem(ROLE_STORAGE_KEY, effectiveRole);
                }
            } catch (error) {
                console.error("Failed to fetch user role:", error);
                // Try to get role from localStorage as fallback
                const saved = localStorage.getItem(ROLE_STORAGE_KEY) as AppRole | null;
                if (saved && defaultRoles.some(r => r.value === saved)) {
                    setRoleState(saved);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    const setRole = React.useCallback((nextRole: AppRole) => {
        setRoleState(nextRole);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
        }
    }, []);

    const value = React.useMemo<RoleContextValue>(
        () => ({ role, setRole, roles: defaultRoles, isLoading }),
        [role, setRole, isLoading]
    );

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
    const ctx = React.useContext(RoleContext);
    if (!ctx) {
        throw new Error("useRole must be used within a RoleProvider");
    }
    return ctx;
}

