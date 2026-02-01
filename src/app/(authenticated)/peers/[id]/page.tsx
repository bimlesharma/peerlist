import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Subject } from '@/types';
import { HeaderSkeleton, ChartSkeleton, TableSkeleton, GridSkeleton } from '@/components/SkeletonLoader';

const PeerDashboardClient = dynamic(() => import('./PeerDashboardClient').then(mod => ({ default: mod.PeerDashboardClient })), {
    loading: () => (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <HeaderSkeleton />
            <GridSkeleton count={6} />
            <ChartSkeleton />
            <ChartSkeleton />
            <TableSkeleton />
        </div>
    ),
    ssr: false
});

interface RecordWithSubjects {
    id: string;
    student_id: string;
    semester: number;
    submitted_at: string;
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

    // Get the peer's profile (mutual consent + marks visibility enforced in RPC)
    const { data: peerProfile } = await supabase.rpc('get_peer_profile', { peer_id: peerId });
    const peerStudent = peerProfile?.[0];

    if (!peerStudent) {
        notFound();
    }

    // Get the peer's subjects (mutual consent + marks visibility enforced in RPC)
    const { data: subjectRows } = await supabase.rpc('get_peer_subjects', { peer_id: peerId });

    const recordsMap = new Map<number, RecordWithSubjects>();
    (subjectRows || []).forEach((row: any) => {
        const semester = row.semester as number;
        if (!recordsMap.has(semester)) {
            recordsMap.set(semester, {
                id: row.record_id,
                student_id: row.student_id,
                semester,
                submitted_at: row.submitted_at,
                subjects: [],
            });
        }

        recordsMap.get(semester)!.subjects.push({
            id: row.subject_id,
            record_id: row.record_id,
            code: row.code,
            name: row.name,
            internal_marks: row.internal_marks,
            external_marks: row.external_marks,
            max_internal: row.max_internal,
            max_external: row.max_external,
            total_marks: row.total_marks,
            credits: row.credits,
            grade: row.grade,
            grade_point: row.grade_point,
        });
    });

    const records = Array.from(recordsMap.values()).sort((a, b) => a.semester - b.semester);

    return (
        <PeerDashboardClient
            peer={peerStudent}
            records={records}
        />
    );
}
