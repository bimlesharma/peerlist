'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

// Theme-aware chart colors
function useChartColors() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return {
        grid: isDark ? '#27272a' : '#d6d3d1',
        axis: isDark ? '#71717a' : '#78716c',
        tooltipBg: isDark ? '#0f0f0f' : '#fafaf9',
        tooltipBorder: isDark ? '#27272a' : '#d6d3d1',
        tooltipText: isDark ? '#ffffff' : '#1c1917',
        centerBg: isDark ? '#0f0f0f' : '#fafaf9',
        ringBg: isDark ? '#18181b' : '#e7e5e4',
        ringStroke: isDark ? '#27272a' : '#d6d3d1',
        polarGrid: isDark ? '#27272a' : '#d6d3d1',
        labelColor: isDark ? '#a1a1aa' : '#57534e',
    };
}

interface SemesterData {
    semester: string;
    semesterNumber?: number;
    sgpa: number;
    totalSubjects: number;
    totalCredits?: number;
}

interface PerformanceChartsProps {
    data: SemesterData[];
    className?: string;
    onSelectSemester?: (semesterNumber: number) => void;
}

export function SGPATrendChart({ data, className, onSelectSemester }: PerformanceChartsProps) {
    const chartColors = useChartColors();
    const chartData = data.map((sem) => ({
        name: `Sem ${sem.semesterNumber || data.indexOf(sem) + 1}`,
        sgpa: typeof sem.sgpa === 'string' ? parseFloat(sem.sgpa) : sem.sgpa,
        fullName: sem.semester,
        semesterNumber: sem.semesterNumber || data.indexOf(sem) + 1,
    }));

    const handleClick = (clickData: { semesterNumber?: number } | null) => {
        if (clickData?.semesterNumber && onSelectSemester) {
            onSelectSemester(clickData.semesterNumber);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChartClick = (e: any) => {
        if (e?.activePayload?.[0]?.payload) {
            handleClick(e.activePayload[0].payload);
        }
    };

    return (
        <div className={cn('bg-[var(--card-bg)] rounded-xl p-4 sm:p-6 border border-[var(--card-border)] animate-fade-in-up card-hover group hover:border-rose-500/30 transition-all duration-300', className)}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-3 sm:h-4 w-1 bg-pink-500 rounded-full animate-glow-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">GPA Trend</h3>
                {onSelectSemester && (
                    <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] ml-auto hidden sm:block">Click point to view</span>
                )}
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} onClick={handleChartClick} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke={chartColors.axis}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={5}
                    />
                    <YAxis
                        domain={[0, 10]}
                        stroke={chartColors.axis}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-5}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: chartColors.tooltipText,
                        }}
                        itemStyle={{ color: '#e11d48' }}
                        formatter={(value) => [Number(value).toFixed(2), 'SGPA']}
                    />
                    <Line
                        type="monotone"
                        dataKey="sgpa"
                        stroke="#e11d48"
                        strokeWidth={3}
                        dot={{ fill: '#0a0a0a', stroke: '#e11d48', strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: '#e11d48', cursor: onSelectSemester ? 'pointer' : 'default' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface GradeDistributionProps {
    grades: { grade: string; count: number; color?: string }[];
    className?: string;
}

export function GradeDistributionChart({ grades, className }: GradeDistributionProps) {
    const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);
    const chartColors = useChartColors();

    // Sort grades by IPU grade order and filter only secured grades
    const gradeOrder = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];
    const sortedGrades = [...grades]
        .filter(g => g.count > 0)
        .sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));

    const totalSubjects = grades.reduce((sum, g) => sum + g.count, 0);
    const maxCount = Math.max(...sortedGrades.map(g => g.count), 1);

    // Theme-consistent colors (rose/pink palette with complementary colors)
    const gradeColors: Record<string, string> = {
        'O': '#f43f5e',   // Rose-500
        'A+': '#fb7185',  // Rose-400
        'A': '#e11d48',   // Rose-600
        'B+': '#be123c',  // Rose-700
        'B': '#9f1239',   // Rose-800
        'C': '#881337',   // Rose-900
        'P': '#4c0519',   // Rose-950
        'F': '#991b1b',   // Red-800
    };

    const gradeLabels: Record<string, string> = {
        'O': 'Outstanding',
        'A+': 'Excellent',
        'A': 'Very Good',
        'B+': 'Good',
        'B': 'Above Avg',
        'C': 'Average',
        'P': 'Pass',
        'F': 'Fail',
    };

    // Chart dimensions - increased for better spacing
    const size = 280;
    const center = size / 2;
    const strokeWidth = 10;
    const ringGap = 14;
    const startRadius = 58;
    const centerRadius = 44;

    // Get hovered grade info
    const hoveredInfo = hoveredGrade ? sortedGrades.find(g => g.grade === hoveredGrade) : null;

    return (
        <div className={cn('bg-[var(--card-bg)] rounded-xl p-4 sm:p-6 border border-[var(--card-border)] animate-fade-in-up card-hover group hover:border-rose-500/30 transition-all duration-300', className)}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-3 sm:h-4 w-1 bg-rose-500 rounded-full" />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Grade Distribution</h3>
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] ml-auto hidden sm:block">Hover to explore</span>
            </div>

            {sortedGrades.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Concentric Rings */}
                    <div className="relative flex-shrink-0">
                        <svg width={size} height={size} className="w-48 h-48 sm:w-[280px] sm:h-[280px]" viewBox={`0 0 ${size} ${size}`}>
                            {/* Center background circle */}
                            <circle
                                cx={center}
                                cy={center}
                                r={centerRadius}
                                fill={chartColors.centerBg}
                            />
                            <circle
                                cx={center}
                                cy={center}
                                r={centerRadius}
                                fill="none"
                                stroke={chartColors.ringStroke}
                                strokeWidth={2}
                            />
                            {sortedGrades.map((item, index) => {
                                const color = gradeColors[item.grade] || '#6b7280';
                                const radius = startRadius + index * ringGap;
                                const circumference = 2 * Math.PI * radius;
                                const fillPercent = (item.count / maxCount);
                                const dashLength = circumference * fillPercent;
                                const gapLength = circumference * (1 - fillPercent);
                                const isHovered = hoveredGrade === item.grade;
                                const hasHover = hoveredGrade !== null;

                                return (
                                    <g key={item.grade}>
                                        {/* Background ring */}
                                        <circle
                                            cx={center}
                                            cy={center}
                                            r={radius}
                                            fill="none"
                                            stroke={chartColors.ringBg}
                                            strokeWidth={strokeWidth}
                                        />
                                        {/* Filled ring */}
                                        <circle
                                            cx={center}
                                            cy={center}
                                            r={radius}
                                            fill="none"
                                            stroke={color}
                                            strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                                            strokeDasharray={`${dashLength} ${gapLength}`}
                                            strokeDashoffset={circumference * 0.25}
                                            strokeLinecap="round"
                                            className="transition-all duration-300 cursor-pointer"
                                            style={{
                                                opacity: hasHover && !isHovered ? 0.25 : 1,
                                                filter: isHovered ? 'drop-shadow(0 0 6px ' + color + ')' : 'none',
                                            }}
                                            onMouseEnter={() => setHoveredGrade(item.grade)}
                                            onMouseLeave={() => setHoveredGrade(null)}
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Center content - properly centered */}
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div
                                className="flex flex-col items-center justify-center text-center transition-all duration-200"
                                style={{
                                    width: centerRadius * 2 * 0.85,
                                    height: centerRadius * 2 * 0.85,
                                }}
                            >
                                {hoveredInfo ? (
                                    <>
                                        <div
                                            className="text-2xl sm:text-3xl font-black transition-colors duration-200"
                                            style={{ color: gradeColors[hoveredInfo.grade] || '#f43f5e' }}
                                        >
                                            {hoveredInfo.count}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                                            {hoveredInfo.grade}
                                        </div>
                                        <div className="text-[8px] sm:text-[10px] text-[var(--text-muted)] mt-0.5">
                                            {Math.round((hoveredInfo.count / totalSubjects) * 100)}%
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{totalSubjects}</div>
                                        <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Subjects</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1.5">
                        {sortedGrades.map((item) => {
                            const color = gradeColors[item.grade] || '#6b7280';
                            const label = gradeLabels[item.grade] || item.grade;
                            const isHovered = hoveredGrade === item.grade;
                            const percentage = totalSubjects > 0 ? Math.round((item.count / totalSubjects) * 100) : 0;

                            return (
                                <div
                                    key={item.grade}
                                    className={cn(
                                        "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer",
                                        isHovered ? "bg-rose-500/10 border border-rose-500/30" : "border border-transparent hover:bg-[var(--hover-bg)]"
                                    )}
                                    onMouseEnter={() => setHoveredGrade(item.grade)}
                                    onMouseLeave={() => setHoveredGrade(null)}
                                >
                                    <div
                                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: color,
                                            boxShadow: isHovered ? `0 0 8px ${color}` : 'none'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{item.grade}</span>
                                            <span className="text-xs sm:text-sm font-bold text-rose-500">{item.count}</span>
                                        </div>
                                        <div className="hidden sm:flex items-center justify-between">
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase">{label}</span>
                                            <span className="text-[10px] text-[var(--text-muted)]">{percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center text-[var(--text-muted)] py-12">
                    No grade data available
                </div>
            )}
        </div>
    );
}

interface SemesterMarksProps {
    data: { semester: string; semesterNumber?: number; totalMarks: number; maxMarks: number }[];
    className?: string;
    onSelectSemester?: (semesterNumber: number) => void;
}

export function SemesterMarksChart({ data, className, onSelectSemester }: SemesterMarksProps) {
    const chartColors = useChartColors();
    const chartData = data.map((sem, index) => ({
        ...sem,
        semesterNumber: sem.semesterNumber || index + 1,
    }));

    const handleClick = (clickData: { semesterNumber?: number } | null) => {
        if (clickData?.semesterNumber && onSelectSemester) {
            onSelectSemester(clickData.semesterNumber);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChartClick = (e: any) => {
        if (e?.activePayload?.[0]?.payload) {
            handleClick(e.activePayload[0].payload);
        }
    };

    return (
        <div className={cn('bg-[var(--card-bg)] rounded-xl p-4 sm:p-6 border border-[var(--card-border)] animate-fade-in-up card-hover group hover:border-rose-500/30 transition-all duration-300', className)}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-3 sm:h-4 w-1 bg-pink-500 rounded-full" />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Marks Progression</h3>
                {onSelectSemester && (
                    <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] ml-auto hidden sm:block">Click bar to view</span>
                )}
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={chartData}
                    barSize={30}
                    onClick={handleChartClick}
                    style={{ cursor: onSelectSemester ? 'pointer' : 'default' }}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                        dataKey="semester"
                        stroke={chartColors.axis}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke={chartColors.axis}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: chartColors.grid, opacity: 0.2 }}
                        contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: chartColors.tooltipText,
                        }}
                    />
                    <Bar dataKey="totalMarks" name="Obtained Marks" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface SubjectRadarProps {
    data: { subject: string; marks: number; fullMark: number }[];
    className?: string;
}

export function SubjectRadarChart({ data, className }: SubjectRadarProps) {
    const chartColors = useChartColors();

    return (
        <div className={cn('bg-[var(--card-bg)] rounded-xl p-4 sm:p-6 border border-[var(--card-border)] animate-fade-in-up card-hover group hover:border-rose-500/30 transition-all duration-300', className)}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-3 sm:h-4 w-1 bg-rose-500 rounded-full" />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Subject Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke={chartColors.polarGrid} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: chartColors.labelColor, fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Marks"
                        dataKey="marks"
                        stroke="#e11d48"
                        strokeWidth={2}
                        fill="#e11d48"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: chartColors.tooltipText,
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
