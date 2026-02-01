import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { AcademicRecord, Subject } from '@/types';
import { Suspense } from 'react';
import { HeaderSkeleton, ChartSkeleton, TableSkeleton, GridSkeleton } from '@/components/SkeletonLoader';

const DashboardClient = dynamic(() => import('./DashboardClient').then(mod => ({ default: mod.DashboardClient })), {
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

interface RecordWithSubjects extends AcademicRecord {
    subjects: Subject[];
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Get student profile
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

    if (studentError || !student) {
        redirect('/onboarding');
    }

    // Get academic records with subjects
    const { data: records } = await supabase
        .from('academic_records')
        .select(`
      *,
      subjects (*)
    `)
        .eq('student_id', user.id)
        .order('semester', { ascending: true });

    return (
        <Suspense
            fallback={
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                    <HeaderSkeleton />
                    <GridSkeleton count={4} />
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <TableSkeleton />
                </div>
            }
        >
            <DashboardClient
                student={student}
                records={(records as RecordWithSubjects[]) || []}
                consentAnalytics={student.consent_analytics || false}
            />
        </Suspense>
    );
}
