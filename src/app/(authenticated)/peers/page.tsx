import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { HeaderSkeleton, GridSkeleton } from '@/components/SkeletonLoader';

const PeersClient = dynamic(() => import('./PeersClient').then(mod => ({ default: mod.PeersClient })), {
    loading: () => (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <HeaderSkeleton />
            <GridSkeleton count={9} />
        </div>
    ),
    ssr: false
});

export default async function PeersPage() {
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

    // Only fetch peers if user has also opted to share marks
    let peersData: {
        id: string;
        name: string;
        enrollment_no: string;
        batch: string | null;
        branch: string | null;
        college: string | null;
        avatar_url: string | null;
        display_name: string | null;
        display_mode: 'anonymous' | 'pseudonymous' | 'visible';
    }[] = [];

    if (student.marks_visibility) {
        const { data: peers } = await supabase.rpc('get_peers_directory');
        if (peers) {
            peersData = peers;
        }
    }

    return (
        <Suspense
            fallback={
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                    <HeaderSkeleton />
                    <GridSkeleton count={6} />
                </div>
            }
        >
            <PeersClient
                student={student}
                peersData={peersData}
            />
        </Suspense>
    );
}
