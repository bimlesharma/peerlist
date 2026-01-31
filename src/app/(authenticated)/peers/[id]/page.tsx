import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { PeerDashboardClient } from './PeerDashboardClient';
import type { AcademicRecord, Subject } from '@/types';

interface RecordWithSubjects extends AcademicRecord {
    subjects: Subject[];
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PeerDashboardPage({ params }: PageProps) {
    const { id: peerId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Get current user's profile
    const { data: currentStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!currentStudent) {
        redirect('/onboarding');
    }

    // Check if current user has opted to share marks
    if (!currentStudent.marks_visibility) {
        redirect('/peers');
    }

    // Get the peer's profile
    const { data: peerStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', peerId)
        .eq('marks_visibility', true)
        .single();

    if (!peerStudent) {
        notFound();
    }

    // Get the peer's academic records
    const { data: records } = await supabase
        .from('academic_records')
        .select(`
            *,
            subjects (*)
        `)
        .eq('student_id', peerId)
        .order('semester', { ascending: true });

    return (
        <PeerDashboardClient
            peer={peerStudent}
            records={(records as RecordWithSubjects[]) || []}
        />
    );
}
