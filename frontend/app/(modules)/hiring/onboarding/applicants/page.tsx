/**
 * Applicants Without Onboarding Page
 * This page displays all applicants with offers who haven't been sent onboarding invitations yet
 */

'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ApplicantsWithoutOnboarding } from '../components';

export default function ApplicantsWithoutOnboardingPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <ApplicantsWithoutOnboarding />
            </div>
        </Layout>
    );
}
