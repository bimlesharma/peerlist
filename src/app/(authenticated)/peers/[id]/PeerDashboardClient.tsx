'use client';

import { useState } from 'react';
import { ResultTable, SemesterSummaryTable } from '@/components/ResultTable';
import { SemesterStats, OverallStats } from '@/components/SemesterStats';
import { SGPATrendChart, GradeDistributionChart, SubjectRadarChart, SemesterMarksChart } from '@/components/PerformanceCharts';
import { SubjectMarksStackedBarChart } from '@/components/SubjectMarksStackedBarChart';
import { ArrowLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marksToGrade, calculateSGPA, calculateCGPA, getGradeDistribution, getSemesterName } from '@/lib/grading';
import type { Student, AcademicRecord, Subject } from '@/types';
import Link from 'next/link';

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

interface PeerDashboardClientProps {
    peer: Student;
    records: RecordWithSubjects[];
}

export function PeerDashboardClient({ peer, records }: PeerDashboardClientProps) {
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

    // Peer info
    const peerName = peer.name || 'Student';
    const enrollmentNo = peer.enrollment_no || 'N/A';
    const institute = peer.college || 'N/A';
    const program = peer.branch || 'N/A';
    const batch = peer.batch || 'N/A';

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

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                {/* Header */}
                <div className="bg-[var(--background)] pt-4 sm:pt-8 pb-4 sm:pb-6 border-b border-[var(--card-border)]">
                    {/* Back button */}
                    <Link
                        href="/peers"
                        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Peers</span>
                    </Link>

                    <div className="flex items-start gap-4 animate-fade-in-up">
                        {/* Avatar */}
                        {peer.avatar_url ? (
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl blur opacity-30" />
                                <img
                                    src={peer.avatar_url}
                                    alt={peerName}
                                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-rose-500/30"
                                />
                            </div>
                        ) : (
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl blur opacity-20" />
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-2 border-rose-500/30 flex items-center justify-center">
                                    <User className="w-8 h-8 text-rose-500/50" />
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
                                {peerName}
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)] font-mono mt-1">
                                {enrollmentNo}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {program && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--secondary)] text-[var(--text-secondary)] rounded-md">
                                        {program}
                                    </span>
                                )}
                                {batch && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/10 text-rose-500 rounded-md">
                                        {batch}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {institute && (
                        <p className="text-sm text-[var(--text-muted)] mt-3">
                            {institute}
                        </p>
                    )}
                </div>

                {!hasData ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 animate-fade-in-up px-4 py-12">
                        <p className="text-[var(--text-secondary)] text-center">
                            No academic data available for this student.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="grid grid-cols-8 sm:flex sm:overflow-x-auto gap-1 sm:gap-2 py-4 sm:py-6 sm:pl-1 no-scrollbar animate-fade-in-up">
                            {tabs.map((tab, index) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-1 sm:px-5 py-2 sm:py-2 rounded-lg text-[10px] sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                        activeTab === tab
                                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 sm:scale-105"
                                            : "bg-[var(--secondary)] text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] border border-[var(--card-border)] hover:border-rose-500/30"
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
                    </>
                )}
            </div>
        </main>
    );
}
