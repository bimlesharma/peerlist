'use client';

import { cn } from '@/lib/utils';
import { marksToGrade } from '@/lib/grading';
import { getSubjectCredits, getSemesterTotalCredits } from '@/data/subjectCredits';

interface SubjectData {
    papercode: string;
    papername: string;
    minorprint: string;  // Internal marks
    majorprint: string;  // External marks
    moderatedprint: string;  // Total marks
}

interface ResultTableProps {
    results: SubjectData[];
    className?: string;
}

export function ResultTable({ results, className }: ResultTableProps) {
    // Calculate totals
    const totalObtained = results.reduce((sum, r) => sum + (parseInt(r.moderatedprint) || 0), 0);
    const totalMax = results.length * 100; // All subjects have max marks of 100

    return (
        <div className={cn("w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] animate-fade-in-up card-hover hover:border-rose-500/30 transition-all duration-300", className)}>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--card-border)] flex items-center gap-2 sm:gap-3">
                <div className="h-3 sm:h-4 w-1 bg-rose-500 rounded-full animate-glow-pulse" />
                <h3 className="font-bold text-[var(--text-secondary)] text-xs sm:text-sm tracking-widest uppercase">Result Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                        <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider">Code</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider hidden sm:table-cell">Subject Name</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center">Cr</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center hidden md:table-cell">Int</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center hidden md:table-cell">Ext</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center">Marks</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center hidden sm:table-cell">Max</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {results.map((result, index) => {
                            const internal = parseInt(result.minorprint) || 0;
                            const external = parseInt(result.majorprint) || 0;
                            const obtained = parseInt(result.moderatedprint) || 0;
                            const maxMarks = 100;
                            const grade = marksToGrade(obtained);
                            const credits = result.papercode ? getSubjectCredits(result.papercode) : undefined;

                            // Color logic for grade
                            let gradeColor = "text-[var(--text-secondary)]";
                            if (grade === "O") gradeColor = "text-emerald-500";
                            if (grade === "A+") gradeColor = "text-cyan-500";
                            if (grade === "A") gradeColor = "text-blue-500";
                            if (grade === "B+") gradeColor = "text-purple-500";
                            if (grade === "B") gradeColor = "text-violet-500";
                            if (grade === "C") gradeColor = "text-amber-500";
                            if (grade === "P") gradeColor = "text-orange-500";
                            if (grade === "F") gradeColor = "text-red-500";

                            const uniqueKey = result.papercode
                                ? `${result.papercode}-${index}`
                                : `subject-${result.papername || 'unknown'}-${index}`;

                            return (
                                <tr key={uniqueKey} className="hover:bg-[var(--hover-bg)] transition-colors">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-[var(--text-secondary)] text-xs sm:text-sm">
                                        {result.papercode || 'N/A'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-[var(--text-primary)] hidden sm:table-cell text-xs sm:text-sm">
                                        {result.papername || 'Unknown Subject'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-amber-400">
                                        {credits !== undefined ? credits : '-'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[var(--text-secondary)] font-mono hidden md:table-cell">
                                        {internal || '-'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[var(--text-secondary)] font-mono hidden md:table-cell">
                                        {external || '-'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-rose-500 text-sm sm:text-base">
                                        {obtained}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-medium text-[var(--text-muted)] hidden sm:table-cell">
                                        {maxMarks}
                                    </td>
                                    <td className={cn("px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base", gradeColor)}>
                                        {grade}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t-2 border-[var(--card-border)] bg-[var(--secondary)]/30">
                        <tr>
                            <td colSpan={2} className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs sm:text-sm hidden sm:table-cell">
                                Total
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs sm:text-sm sm:hidden">
                                Total
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell"></td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell"></td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell"></td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-rose-500 text-base sm:text-lg">
                                {totalObtained}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-[var(--text-secondary)] text-base sm:text-lg hidden sm:table-cell">
                                {totalMax}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-[var(--text-muted)] text-xs sm:text-sm">
                                {totalMax > 0 ? `${((totalObtained / totalMax) * 100).toFixed(1)}%` : '-'}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Show note if any credits are missing */}
            {results.some(r => r.papercode && getSubjectCredits(r.papercode) === undefined) && (
                <div className="px-6 py-3 bg-amber-900/20 border-t border-amber-700/30">
                    <p className="text-xs text-amber-400 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                            Credit data for some subjects was not found. This data will be added shortly.
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}

interface SemesterSummaryProps {
    data: {
        semester: string;
        semesterNumber: number;
        sgpa: number;
        totalCredits: number;
        totalMarks: number;
        maxMarks: number;
    }[];
    className?: string;
    onSelectSemester?: (semesterNumber: number) => void;
}

export function SemesterSummaryTable({ data, className, onSelectSemester }: SemesterSummaryProps) {
    // Calculate grand totals with credits from data file
    const grandTotalObtained = data.reduce((sum, sem) => sum + sem.totalMarks, 0);
    const grandTotalMax = data.reduce((sum, sem) => sum + sem.maxMarks, 0);

    // Calculate credits using data file for consistency
    const semesterCredits = data.map(sem => {
        const expectedCredits = getSemesterTotalCredits(sem.semesterNumber);
        // Use expected credits if available, otherwise fall back to calculated
        return expectedCredits > 0 ? expectedCredits : (sem.totalCredits || 0);
    });
    const grandTotalCredits = semesterCredits.reduce((sum, credits) => sum + credits, 0);

    return (
        <div className={cn("w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] animate-fade-in-up card-hover hover:border-rose-500/30 transition-all duration-300", className)}>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--card-border)] flex items-center gap-2 sm:gap-3">
                <div className="h-3 sm:h-4 w-1 bg-pink-500 rounded-full animate-glow-pulse" />
                <h3 className="font-bold text-[var(--text-secondary)] text-xs sm:text-sm tracking-widest uppercase">Overall Breakdown</h3>
                {onSelectSemester && (
                    <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] ml-auto hidden sm:block">Click row to view</span>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                        <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider">Semester</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center">Obtained</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center hidden sm:table-cell">Max</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-center">SGPA</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold tracking-wider text-right">Credits</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((sem, index) => {
                            const expectedCredits = getSemesterTotalCredits(sem.semesterNumber);
                            const displayCredits = expectedCredits > 0 ? expectedCredits : sem.totalCredits;

                            return (
                                <tr
                                    key={`${sem.semester}-${index}`}
                                    className={cn(
                                        "transition-colors",
                                        onSelectSemester
                                            ? "hover:bg-rose-500/10 cursor-pointer group"
                                            : "hover:bg-[var(--hover-bg)]"
                                    )}
                                    onClick={() => onSelectSemester?.(sem.semesterNumber)}
                                >
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-[var(--text-primary)] group-hover:text-rose-400 transition-colors text-xs sm:text-sm">
                                        {sem.semester}
                                        {onSelectSemester && (
                                            <span className="ml-1 sm:ml-2 text-[var(--text-muted)] group-hover:text-rose-400 text-[10px] sm:text-xs">→</span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-rose-500 text-sm sm:text-base">
                                        {sem.totalMarks}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-medium text-[var(--text-secondary)] hidden sm:table-cell">
                                        {sem.maxMarks}
                                    </td>
                                    <td className={cn("px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base",
                                        sem.sgpa >= 9 ? "text-yellow-500" :
                                            sem.sgpa >= 8 ? "text-rose-500" :
                                                sem.sgpa >= 7 ? "text-purple-400" : "text-[var(--text-primary)]"
                                    )}>
                                        {sem.sgpa.toFixed(2)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-medium text-amber-400">
                                        {displayCredits || "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t-2 border-[var(--card-border)] bg-[var(--secondary)]/30">
                        <tr>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs sm:text-sm">
                                Total
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-rose-500 text-base sm:text-lg">
                                {grandTotalObtained}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-[var(--text-secondary)] text-base sm:text-lg hidden sm:table-cell">
                                {grandTotalMax}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-[var(--text-muted)] text-xs sm:text-sm">
                                {grandTotalMax > 0 ? `${((grandTotalObtained / grandTotalMax) * 100).toFixed(1)}%` : '-'}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-amber-400">
                                {grandTotalCredits || "-"}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
