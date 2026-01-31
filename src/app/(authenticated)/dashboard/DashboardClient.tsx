'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ResultTable, SemesterSummaryTable } from '@/components/ResultTable';
import { SemesterStats, OverallStats } from '@/components/SemesterStats';
import { SGPATrendChart, GradeDistributionChart, SubjectRadarChart, SemesterMarksChart } from '@/components/PerformanceCharts';
import { SubjectMarksStackedBarChart } from '@/components/SubjectMarksStackedBarChart';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marksToGrade, calculateSGPA, calculateCGPA, getGradeDistribution, getSemesterName } from '@/lib/grading';
import type { Student, AcademicRecord, Subject } from '@/types';

interface RecordWithSubjects extends AcademicRecord {
    subjects: Subject[];
}

interface ProcessedSemester {
    semester: string;
    semesterNumber: number;
    subjects: Subject[];
    sgpa: number;
    totalCredits: number;
    totalSubjects: number;
    totalMarks: number;
    maxMarks: number;
}

interface DashboardClientProps {
    student: Student;
    records: RecordWithSubjects[];
}

export function DashboardClient({ student, records }: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState('Overall');

    const hasData = records.length > 0;

    // Process semester data
    const processed: ProcessedSemester[] = records.map(record => {
        const { sgpa, totalCredits } = calculateSGPA(record.subjects);
        const totalMarks = record.subjects.reduce((sum, s) => sum + s.total_marks, 0);
        const maxMarks = record.subjects.length * 100;

        return {
            semester: getSemesterName(record.semester),
            semesterNumber: record.semester,
            subjects: record.subjects,
            sgpa,
            totalCredits,
            totalSubjects: record.subjects.length,
            totalMarks,
            maxMarks,
        };
    });

    // Calculate overall stats
    const allSubjects = records.flatMap(r => r.subjects);
    const cgpa = calculateCGPA(processed.map(p => ({ sgpa: p.sgpa, totalCredits: p.totalCredits })));
    const gradeDistribution = getGradeDistribution(allSubjects);
    const totalCredits = processed.reduce((sum, p) => sum + p.totalCredits, 0);

    // Student info from profile
    const studentName = student.name || 'Student';
    const enrollmentNo = student.enrollment_no || 'N/A';
    const institute = student.college || 'N/A';
    const program = student.branch || 'N/A';
    const admissionYear = student.batch || 'N/A';

    // Tabs
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    const tabs = ['Overall', ...processed.map(p => `Sem ${p.semesterNumber}`)];
    const tabsMobile = ['All', ...processed.map(p => romanNumerals[p.semesterNumber - 1] || `${p.semesterNumber}`)];

    // Current View Data
    const currentSemData = activeTab !== 'Overall'
        ? processed.find(p => `Sem ${p.semesterNumber}` === activeTab)
        : null;

    // Radar Data for specific semester
    const radarData = currentSemData?.subjects.map(sub => ({
        subject: sub.code,
        marks: sub.total_marks || 0,
        fullMark: 100
    })) || [];

    // Calculate semester-wise grade distribution
    const semesterGradeDistribution = currentSemData ? (() => {
        const distribution = new Map<string, number>();
        currentSemData.subjects.forEach(sub => {
            const grade = sub.grade || marksToGrade(sub.total_marks);
            distribution.set(grade, (distribution.get(grade) || 0) + 1);
        });
        return Array.from(distribution.entries()).map(([grade, count]) => ({
            grade,
            count,
            color: ''
        }));
    })() : [];

    // Fake refresh handler (data is server-rendered)
    const handleRefresh = () => {
        window.location.reload();
    };

    if (!hasData) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 sm:gap-6 animate-fade-in-up px-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl" />
                        <AlertCircle className="relative w-12 h-12 sm:w-16 sm:h-16 text-rose-500" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Academic Data Found</h2>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                            Your academic records may not have been fetched properly during registration.
                            Please contact support if you believe this is an error.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                <DashboardHeader
                    studentName={studentName}
                    enrollmentNo={enrollmentNo}
                    institute={institute}
                    program={program}
                    batch={admissionYear}
                    profileImage={student.avatar_url || undefined}
                    onRefresh={handleRefresh}
                />

                {/* Tabs */}
                <div className="grid grid-cols-8 sm:flex sm:overflow-x-auto gap-1 sm:gap-2 py-4 sm:py-6 sm:pl-1 no-scrollbar animate-fade-in-up">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-1 sm:px-5 py-2 sm:py-2 rounded-lg text-[10px] sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap btn-shine ripple",
                                activeTab === tab
                                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 sm:scale-105"
                                    : "bg-[var(--secondary)] text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] border border-[var(--card-border)] hover:border-rose-500/30 sm:hover:scale-102"
                            )}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <span className="sm:hidden">{tabsMobile[index]}</span>
                            <span className="hidden sm:inline">{tab}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div key={activeTab} className="space-y-4 sm:space-y-6 md:space-y-8 animate-blur-in">
                    {activeTab === 'Overall' ? (
                        <>
                            <OverallStats
                                totalObtained={processed.reduce((sum, sem) => sum + sem.totalMarks, 0)}
                                totalMax={processed.reduce((sum, sem) => sum + sem.maxMarks, 0)}
                                cgpa={cgpa}
                                totalCredits={totalCredits}
                                totalSubjects={allSubjects.length}
                                totalSemesters={processed.length}
                                semesterNumbers={processed.map(p => p.semesterNumber)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <SGPATrendChart
                                    data={processed.map(p => ({
                                        semester: p.semester,
                                        semesterNumber: p.semesterNumber,
                                        sgpa: p.sgpa,
                                        totalSubjects: p.totalSubjects,
                                        totalCredits: p.totalCredits,
                                    }))}
                                    onSelectSemester={(semNum) => setActiveTab(`Sem ${semNum}`)}
                                />
                                <GradeDistributionChart grades={gradeDistribution} />
                            </div>
                            <SemesterMarksChart
                                data={processed}
                                onSelectSemester={(semNum) => setActiveTab(`Sem ${semNum}`)}
                            />
                            <SemesterSummaryTable
                                data={processed}
                                onSelectSemester={(semNum) => setActiveTab(`Sem ${semNum}`)}
                            />
                        </>
                    ) : currentSemData ? (
                        <>
                            <SemesterStats
                                totalMarks={currentSemData.totalMarks}
                                maxMarks={currentSemData.maxMarks}
                                sgpa={currentSemData.sgpa}
                                credits={currentSemData.totalCredits}
                                semesterNumber={currentSemData.semesterNumber}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <GradeDistributionChart grades={semesterGradeDistribution} />
                                <SubjectRadarChart data={radarData} />
                            </div>
                            <SubjectMarksStackedBarChart
                                data={currentSemData.subjects.map(s => ({
                                    subject: s.code,
                                    subjectName: s.name,
                                    internal: s.internal_marks || 0,
                                    external: s.external_marks || 0,
                                    total: s.total_marks || 0
                                }))}
                            />
                            <ResultTable
                                results={currentSemData.subjects.map(s => ({
                                    papercode: s.code,
                                    papername: s.name,
                                    minorprint: String(s.internal_marks || 0),
                                    majorprint: String(s.external_marks || 0),
                                    moderatedprint: String(s.total_marks || 0),
                                }))}
                            />
                        </>
                    ) : null}
                </div>
            </div>
        </main>
    );
}
