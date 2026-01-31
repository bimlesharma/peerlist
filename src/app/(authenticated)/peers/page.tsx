import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PeersClient } from './PeersClient';

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
    }[] = [];

    if (student.marks_visibility) {
        // Get all students who have opted to share marks (excluding current user)
        const { data: peers } = await supabase
            .from('students')
            .select(`
                id,
                name,
                enrollment_no,
                batch,
                branch,
                college,
                avatar_url
            `)
            .eq('marks_visibility', true)
            .neq('id', user.id);

        if (peers) {
            peersData = peers;
        }
    }

    return (
        <PeersClient
            student={student}
            peersData={peersData}
        />
    );
}
