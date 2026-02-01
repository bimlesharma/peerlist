import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { RankboardEntry } from '@/types';
import { Suspense } from 'react';
import { HeaderSkeleton, ChartSkeleton, TableSkeleton } from '@/components/SkeletonLoader';

const RankboardClient = dynamic(() => import('./RankboardClient').then(mod => ({ default: mod.RankboardClient })), {
    loading: () => (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <HeaderSkeleton />
            <ChartSkeleton />
            <TableSkeleton />
        </div>
    ),
    ssr: false
});

export default async function RankboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Get current user's profile
    const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!student) {
        redirect('/onboarding');
    }

    // Only fetch rankboard if user has opted in (RPC also enforces both consents)
    let rankboardData: RankboardEntry[] = [];

    if (student.consent_rankboard && student.consent_analytics) {
        const { data: rankedStudents } = await supabase.rpc('get_rankboard');
        if (rankedStudents) {
            rankboardData = rankedStudents as RankboardEntry[];
            rankboardData.sort((a, b) => b.cgpa - a.cgpa);
        }
    }

    return (
        <Suspense
            fallback={
                <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                    <HeaderSkeleton />
                    <ChartSkeleton />
                    <TableSkeleton />
                </div>
            }
        >
            <RankboardClient
                student={student}
                rankboardData={rankboardData}
                currentUserId={user.id}
            />
        </Suspense>
    );
}
