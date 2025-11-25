import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types/user.types';

export interface InterviewerUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

/**
 * Hook to fetch and manage users from the database for interview panels
 */
export function useUsers() {
    const [users, setUsers] = useState<InterviewerUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch users from the local database
            const response = await api.get<{
                users: User[];
            }>('/auth/users/');

            // Transform the users to match the interviewer format
            const transformedUsers: InterviewerUser[] = response.data.users.map(user => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                return {
                    id: user.id || '',
                    name: fullName || user.email || 'Unknown User',
                    email: user.email || '',
                    role: user.jobTitle || user.department || 'Staff Member'
                };
            }).filter(user => user.email && user.name !== 'Unknown User'); // Filter out invalid users

            setUsers(transformedUsers);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.error || 'Failed to fetch users from the database');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        users,
        loading,
        error,
        refetch: fetchUsers
    };
}
