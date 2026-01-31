'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

interface SubjectMarksStackedProps {
    data: { subject: string; subjectName?: string; internal: number; external: number; total: number }[];
    className?: string;
}

// Custom tooltip to show full subject name
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; payload: { subjectName?: string } }[]; label?: string }) => {
    if (active && payload && payload.length) {
        const subjectName = payload[0]?.payload?.subjectName;
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-xl">
                {subjectName && (
                    <p className="text-[var(--text-primary)] font-bold text-sm mb-1">{subjectName}</p>
                )}
                <p className="text-[var(--text-secondary)] text-xs mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[var(--text-secondary)]">{entry.name}:</span>
                        <span className="text-[var(--text-primary)] font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function SubjectMarksStackedBarChart({ data, className }: SubjectMarksStackedProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const chartColors = {
        grid: isDark ? '#27272a' : '#d6d3d1',
        axis: isDark ? '#71717a' : '#78716c',
        cursor: isDark ? '#333' : '#d6d3d1',
        internal: isDark ? '#71717a' : '#a8a29e',
    };

    return (
        <div className={cn('bg-[var(--card-bg)] rounded-xl p-4 sm:p-6 border border-[var(--card-border)] animate-fade-in-up card-hover group hover:border-rose-500/30 transition-all duration-300', className)}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-3 sm:h-4 w-1 bg-pink-500 rounded-full animate-glow-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Subject Performance</h3>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} barSize={16} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                        dataKey="subject"
                        stroke={chartColors.axis}
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={50}
                    />
                    <YAxis
                        stroke={chartColors.axis}
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: chartColors.cursor, opacity: 0.2 }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="internal" name="Internal" stackId="a" fill={chartColors.internal} />
                    <Bar dataKey="external" name="External" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
