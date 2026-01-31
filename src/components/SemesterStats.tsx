'use client';

import { getSemesterTotalCredits } from '@/data/subjectCredits';

interface SemesterStatsProps {
    totalMarks: number;
    maxMarks: number;
    sgpa: number;
    credits: number;
    semesterNumber?: number;
}

export function SemesterStats({ totalMarks, maxMarks, sgpa, credits, semesterNumber }: SemesterStatsProps) {
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    // Use credits from data file if semester number is provided
    const displayCredits = semesterNumber
        ? (getSemesterTotalCredits(semesterNumber) || credits)
        : credits;

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {/* Marks */}
            <div className="animate-fade-in-up stagger-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300 card-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 sm:mb-3">Marks</h3>
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                        <span className="text-xl sm:text-3xl font-bold text-rose-500 animate-count-up">{totalMarks}</span>
                        <span className="text-sm sm:text-xl font-medium text-[var(--text-muted)]">/ {maxMarks}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-2">Total Marks Obtained</p>
                </div>
            </div>

            {/* SGPA */}
            <div className="animate-fade-in-up stagger-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300 card-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 sm:mb-3">SGPA</h3>
                    <div className="text-xl sm:text-3xl font-bold text-rose-500 animate-count-up">{sgpa.toFixed(2)}</div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-2">Semester GPA</p>
                </div>
            </div>

            {/* Percentage */}
            <div className="animate-fade-in-up stagger-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300 card-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 sm:mb-3">Percentage</h3>
                    <div className="text-xl sm:text-3xl font-bold text-rose-500 animate-count-up">{percentage.toFixed(1)}%</div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-2">Marks Percentage</p>
                </div>
            </div>

            {/* Credits */}
            <div className="animate-fade-in-up stagger-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300 card-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 sm:mb-3">Credits</h3>
                    <div className="text-xl sm:text-3xl font-bold text-amber-400 animate-count-up">{displayCredits || '-'}</div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-2">Semester Credits</p>
                </div>
            </div>
        </div>
    );
}

interface OverallStatsProps {
    totalObtained: number;
    totalMax: number;
    cgpa: number;
    totalCredits: number;
    totalSubjects: number;
    totalSemesters: number;
    semesterNumbers?: number[];
}

export function OverallStats({ totalObtained, totalMax, cgpa, totalCredits, totalSubjects, totalSemesters, semesterNumbers }: OverallStatsProps) {
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    // Calculate total credits from data file if semester numbers provided
    let displayCredits = totalCredits;
    if (semesterNumbers && semesterNumbers.length > 0) {
        const dataCredits = semesterNumbers.reduce((sum, semNum) => {
            const credits = getSemesterTotalCredits(semNum);
            return sum + (credits || 0);
        }, 0);
        if (dataCredits > 0) {
            displayCredits = dataCredits;
        }
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {/* Marks - Combined Obtained/Maximum */}
            <div className="animate-fade-in-up stagger-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 md:p-5 relative overflow-hidden group transition-all duration-300 card-hover hover:border-rose-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Marks</h3>
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-rose-500 animate-count-up">{totalObtained}</span>
                        <span className="text-sm sm:text-base font-medium text-[var(--text-muted)]">/ {totalMax}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 sm:mt-1">Total Obtained</p>
                </div>
            </div>

            {/* Percentage */}
            <div className="animate-fade-in-up stagger-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 md:p-5 relative overflow-hidden group transition-all duration-300 card-hover hover:border-rose-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Percentage</h3>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-rose-500 animate-count-up">{percentage.toFixed(1)}%</div>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 sm:mt-1">Overall</p>
                </div>
            </div>

            {/* CGPA */}
            <div className="animate-fade-in-up stagger-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 md:p-5 relative overflow-hidden group transition-all duration-300 card-hover hover:border-rose-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">CGPA</h3>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-rose-500 animate-count-up">{cgpa.toFixed(2)}</div>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 sm:mt-1">Cumulative GPA</p>
                </div>
            </div>

            {/* Credits */}
            <div className="animate-fade-in-up stagger-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 md:p-5 relative overflow-hidden group transition-all duration-300 card-hover hover:border-amber-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Credits</h3>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-amber-400 animate-count-up">{displayCredits}</div>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 sm:mt-1">Total Earned</p>
                </div>
            </div>

            {/* Subjects */}
            <div className="animate-fade-in-up stagger-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 md:p-5 relative overflow-hidden group transition-all duration-300 card-hover hover:border-[var(--card-border)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2">Subjects</h3>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-primary)] animate-count-up">{totalSubjects}</div>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 sm:mt-1">{totalSemesters} Semesters</p>
                </div>
            </div>
        </div>
    );
}
