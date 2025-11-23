"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRouter } from "next/navigation";
import { useAuthViewModel } from "@/app/(modules)/auth/auth.viewmodel";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { User } from "@/types/user.types";

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, user, setUser, logout } = useAuthViewModel();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            // Check if token exists in localStorage
            const token = localStorage.getItem('access_token');

            // If no token, clear auth state and redirect
            if (!token) {
                await logout(); // Clear Zustand state
                router.push("/auth");
                return;
            }

            // If not authenticated in Zustand but token exists, try to fetch user
            if (!isAuthenticated) {
                try {
                    const response = await api.get<User>('/auth/profile/');
                    setUser(response.data);
                    setLoading(false);
                } catch (err) {
                    console.error('Failed to fetch user data:', err);
                    setError('Failed to load user data');
                    await logout();
                    router.push("/auth");
                }
                return;
            }

            // If authenticated but no user data, fetch it
            if (isAuthenticated && !user) {
                try {
                    const response = await api.get<User>('/auth/profile/');
                    setUser(response.data);
                } catch (err) {
                    console.error('Failed to fetch user data:', err);
                    setError('Failed to load user data');
                    await logout();
                    router.push("/auth");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isAuthenticated, user, router, setUser]);

    const handleLogout = async () => {
        await logout();
        router.push("/auth");
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 font-semibold mb-2">Error</p>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <div className="space-y-8 p-6">
                <section className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome to K12 ERP
                        </h1>
                        <Button
                            onClick={handleLogout}
                            variant="secondary"
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                        >
                            Sign Out
                        </Button>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            User Profile - Complete Data
                        </h2>

                        {/* Basic Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                                    <p className="text-gray-900 font-mono text-sm break-all">{user.id}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="text-gray-900 font-medium break-all">{user.email}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">First Name</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.firstName || <span className="text-gray-400 italic">Not set</span>}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Last Name</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.lastName || <span className="text-gray-400 italic">Not set</span>}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : <span className="text-gray-400 italic">Not available</span>}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Email Verified</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.isEmailVerified ? (
                                            <span className="inline-flex items-center text-green-700">
                                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Yes (Verified)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-yellow-700">
                                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                No (Not verified)
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(user.dateJoined).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(user.dateJoined).toLocaleString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Azure AD / Entra ID Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Azure AD / Entra ID</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Entra ID (Azure AD User ID)</p>
                                    <p className="text-gray-900 font-mono text-sm break-all">
                                        {user.entraId || <span className="text-gray-400 italic">Not linked to Azure AD</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Active Directory Groups */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Directory Groups</h3>
                            {user.adGroups && user.adGroups.length > 0 ? (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-2">Group Names ({user.adGroups.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.adGroups.map((group: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {group}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {user.adGroupIds && user.adGroupIds.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <p className="text-sm text-gray-600 mb-2">Group IDs ({user.adGroupIds.length})</p>
                                            <div className="space-y-1">
                                                {user.adGroupIds.map((groupId: string, index: number) => (
                                                    <div key={index} className="bg-blue-100 p-2 rounded text-xs font-mono break-all">
                                                        {groupId}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {user.adGroupsSyncedAt && (
                                        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-200">
                                            <strong>Last synced:</strong> {new Date(user.adGroupsSyncedAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-500 italic">No Active Directory groups assigned</p>
                                </div>
                            )}
                        </div>

                        {/* Raw JSON Data */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Raw User Data (JSON)</h3>
                            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-green-400 text-xs font-mono">
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Data Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Data Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Total Fields:</p>
                                    <p className="font-bold text-gray-900">{Object.keys(user).length}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">AD Groups:</p>
                                    <p className="font-bold text-gray-900">{user.adGroups?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">AD Group IDs:</p>
                                    <p className="font-bold text-gray-900">{user.adGroupIds?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Azure AD Linked:</p>
                                    <p className="font-bold text-gray-900">{user.entraId ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
