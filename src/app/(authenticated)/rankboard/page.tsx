import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RankboardClient } from './RankboardClient';
import { marksToGradePoint } from '@/lib/grading';

interface SubjectData {
    credits: number;
    grade_point: number | null;
    total_marks: number;
}

interface RecordData {
    id: string;
    semester: number;
    subjects: SubjectData[];
}

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

    // Only fetch rankboard if user has opted in
    let rankboardData: {
        id: string;
        display_name: string;
        batch: string | null;
        branch: string | null;
        college: string | null;
        cgpa: number;
    }[] = [];

    if (student.consent_rankboard) {
        // Get all opted-in students with their calculated CGPAs
        const { data: rankedStudents } = await supabase
            .from('students')
            .select(`
                id,
                name,
                batch,
                branch,
                college,
                display_mode,
                consent_rankboard
            `)
            .eq('consent_rankboard', true);

        if (rankedStudents) {
            // Calculate CGPAs for each student using the same method as dashboard
            for (const s of rankedStudents) {
                const { data: records } = await supabase
                    .from('academic_records')
                    .select('*, subjects (*)')
                    .eq('student_id', s.id)
                    .order('semester', { ascending: true });

                // Calculate SGPA for each semester first (same as dashboard)
                const semesterData: { sgpa: number; totalCredits: number }[] = [];

                if (records) {
                    for (const record of records as RecordData[]) {
                        const subjects = record.subjects || [];

                        let semCreditPoints = 0;
                        let semCredits = 0;

                        for (const sub of subjects) {
                            // Use stored grade_point if available, otherwise calculate from marks
                            const gradePoint = sub.grade_point ?? marksToGradePoint(sub.total_marks || 0);
                            const credits = sub.credits || 0;

                            // Match calculateSGPA logic: only include if gradePoint > 0 and credits > 0
                            if (gradePoint > 0 && credits > 0) {
                                semCreditPoints += credits * gradePoint;
                                semCredits += credits;
                            }
                        }

                        // Calculate SGPA for this semester (rounded to 2 decimal places, same as dashboard)
                        const sgpa = semCredits > 0
                            ? Math.round((semCreditPoints / semCredits) * 100) / 100
                            : 0;

                        if (semCredits > 0) {
                            semesterData.push({ sgpa, totalCredits: semCredits });
                        }
                    }
                }

                // Calculate CGPA from semester SGPAs (same as calculateCGPA function)
                let totalCreditPoints = 0;
                let totalCredits = 0;

                for (const sem of semesterData) {
                    totalCreditPoints += sem.sgpa * sem.totalCredits;
                    totalCredits += sem.totalCredits;
                }

                const cgpa = totalCredits > 0
                    ? Math.round((totalCreditPoints / totalCredits) * 100) / 100
                    : 0;

                // Apply display mode
                let displayName = 'Anonymous';
                if (s.display_mode === 'visible') {
                    displayName = s.name || 'Student';
                } else if (s.display_mode === 'pseudonymous') {
                    displayName = `Student ${s.id.substring(0, 4)}`;
                }

                rankboardData.push({
                    id: s.id,
                    display_name: displayName,
                    batch: s.batch,
                    branch: s.branch,
                    college: s.college,
                    cgpa,
                });
            }

            // Sort by CGPA descending
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
