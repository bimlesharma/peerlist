import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RankboardClient } from './RankboardClient';
import type { RankboardEntry } from '@/types';

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
        <RankboardClient
            student={student}
            rankboardData={rankboardData}
            currentUserId={user.id}
        />
    );
}
