'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Student } from '@/types';
import { Trophy, Lock, Users, Filter, Loader2, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { ChartSkeleton } from '@/components/SkeletonLoader';

// Lazy load Recharts to reduce initial bundle size
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });

interface RankboardEntry {
    student_id: string;
    display_name: string | null;
    batch: string | null;
    branch: string | null;
    college: string | null;
    cgpa: number;
}

interface RankboardClientProps {
    student: Student;
    rankboardData: RankboardEntry[];
    currentUserId: string;
}

export function RankboardClient({ student, rankboardData, currentUserId }: RankboardClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Set default filters to user's own batch, branch, and college
    const [batchFilter, setBatchFilter] = useState<string>(student.batch || 'all');
    const [branchFilter, setBranchFilter] = useState<string>(student.branch || 'all');
    const [collegeFilter, setCollegeFilter] = useState<string>(student.college || 'all');

    // Get unique batches, branches, and colleges for filters
    const batches = [...new Set(rankboardData.map(r => r.batch).filter(Boolean))].sort() as string[];
    const branches = [...new Set(rankboardData.map(r => r.branch).filter(Boolean))].sort() as string[];
    const colleges = [...new Set(rankboardData.map(r => r.college).filter(Boolean))].sort() as string[];

    // Apply filters
    let filteredData = rankboardData;
    if (batchFilter !== 'all') {
        filteredData = filteredData.filter(r => r.batch === batchFilter);
    }
    if (branchFilter !== 'all') {
        filteredData = filteredData.filter(r => r.branch === branchFilter);
    }
    if (collegeFilter !== 'all') {
        filteredData = filteredData.filter(r => r.college === collegeFilter);
    }

    // Check if any filters are active
    const hasActiveFilters = batchFilter !== 'all' || branchFilter !== 'all' || collegeFilter !== 'all';

    const clearAllFilters = () => {
        setBatchFilter('all');
        setBranchFilter('all');
        setCollegeFilter('all');
    };

    // CGPA trend data (rank vs CGPA)
    const cgpaTrendData = filteredData.map((entry, index) => ({
        rank: index + 1,
        cgpa: Number(entry.cgpa.toFixed(2)),
        name: entry.display_name || 'Anonymous',
    }));

    const handleOptIn = async () => {
        setLoading(true);
        try {
            await supabase
                .from('students')
                .update({ consent_rankboard: true })
                .eq('id', currentUserId);

            router.refresh();
        } catch (err) {
            console.error('Opt-in error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Not opted in - show gate
    if (!student.consent_rankboard) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="card p-8 text-center animate-fade-in-up">
                    <div className="p-4 rounded-full bg-rose-500/10 w-fit mx-auto mb-4">
                        <Lock className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                        Rankboard Access
                    </h1>
                    <p className="text-(--text-secondary) mb-6 max-w-md mx-auto">
                        To view and participate in the rankboard, you need to share your academic data.
                        This is a fair-trade model: you share to see, others share to be seen.
                    </p>

                    <div className="p-4 rounded-lg bg-secondary border border-(--card-border) mb-6 text-left">
                        <h3 className="font-medium text-(--text-primary) mb-2">
                            What happens when you opt in:
                        </h3>
                        <ul className="text-sm text-(--text-secondary) space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                Your CGPA appears on the rankboard
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                You can see other opted-in students&apos; rankings
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                Your identity is <strong>anonymous by default</strong>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                You can opt out anytime in Settings
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleOptIn}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Opting in...
                            </>
                        ) : (
                            <>
                                <Users className="w-5 h-5" />
                                Opt In to Rankboard
                            </>
                        )}
                    </button>

                    <p className="text-xs text-(--text-muted) mt-4">
                        By opting in, you agree to share your anonymized academic performance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-(--text-primary)">
                        Rankboard
                    </h1>
                    <p className="text-(--text-secondary) mt-1">
                        {filteredData.length} participant{filteredData.length !== 1 ? 's' : ''}
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
                <Link href="/settings" className="text-sm text-(--text-muted) hover:text-rose-500 transition-colors">
                    Manage participation →
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-(--card-bg) border border-(--card-border) rounded-xl p-4 mb-6 animate-fade-in-up stagger-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-medium text-(--text-primary)">Filters:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        {batches.length > 0 && (
                            <select
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="bg-(--input-bg) border border-(--card-border) rounded-lg px-3 py-1.5 text-sm text-(--text-primary) focus:border-rose-500 focus:outline-none transition-colors max-w-[140px] truncate"
                            >
                                <option value="all">All Batches</option>
                                {batches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        )}

                        {branches.length > 0 && (
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="bg-(--input-bg) border border-(--card-border) rounded-lg px-3 py-1.5 text-sm text-(--text-primary) focus:border-rose-500 focus:outline-none transition-colors flex-1 min-w-[200px] max-w-full sm:max-w-[300px] truncate"
                            >
                                <option value="all">All Branches</option>
                                {branches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        )}

                        {colleges.length > 0 && (
                            <select
                                value={collegeFilter}
                                onChange={(e) => setCollegeFilter(e.target.value)}
                                className="bg-(--input-bg) border border-(--card-border) rounded-lg px-3 py-1.5 text-sm text-(--text-primary) focus:border-rose-500 focus:outline-none transition-colors flex-1 min-w-[200px] max-w-full sm:max-w-[300px] truncate"
                            >
                                <option value="all">All Colleges</option>
                                {colleges.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                            >
                                <X className="w-3 h-3" />
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* CGPA Trend Chart */}
            {filteredData.length > 0 && (
                <div className="bg-(--card-bg) border border-(--card-border) rounded-xl p-6 mb-6 animate-fade-in-up stagger-2">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        <h2 className="text-lg font-bold text-(--text-primary)">
                            CGPA Trend
                        </h2>
                    </div>
                    <p className="text-sm text-(--text-secondary) mb-6">
                        CGPA by rank across {filteredData.length} participant{filteredData.length !== 1 ? 's' : ''}
                    </p>
                    <div className="w-full h-64 min-h-[260px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minHeight={260} minWidth={0}>
                            <LineChart data={cgpaTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#d6d3d1'} />
                                <XAxis
                                    dataKey="rank"
                                    stroke={isDark ? '#71717a' : '#78716c'}
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `#${value}`}
                                />
                                <YAxis
                                    stroke={isDark ? '#71717a' : '#78716c'}
                                    style={{ fontSize: '12px' }}
                                    domain={[0, 10]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#0f0f0f' : '#fafaf9',
                                        border: `1px solid ${isDark ? '#27272a' : '#d6d3d1'}`,
                                        borderRadius: '8px',
                                        color: isDark ? '#ffffff' : '#1c1917',
                                    }}
                                    labelStyle={{ color: isDark ? '#ffffff' : '#1c1917' }}
                                    formatter={(value: any) => {
                                        if (value === undefined || value === null) return ['-', 'CGPA'];
                                        const numValue = typeof value === 'number' ? value : parseFloat(value);
                                        return [numValue.toFixed(2), 'CGPA'];
                                    }}
                                    labelFormatter={(label) => `Rank #${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cgpa"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    dot={{ r: 3, stroke: '#f43f5e', strokeWidth: 2 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Rankboard Table */}
            {filteredData.length > 0 ? (
                <div className="bg-(--card-bg) border border-(--card-border) rounded-xl overflow-hidden animate-fade-in-up stagger-3">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--card-border) bg-secondary">
                                    <th className="w-20 px-4 py-4 text-left text-xs font-bold text-(--text-primary) uppercase tracking-wider">Rank</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-(--text-primary) uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-(--text-primary) uppercase tracking-wider hidden sm:table-cell">Batch</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-(--text-primary) uppercase tracking-wider hidden md:table-cell">Branch</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-(--text-primary) uppercase tracking-wider">CGPA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--card-border)">
                                {filteredData.map((entry, index) => {
                                    const isCurrentUser = entry.student_id === currentUserId;
                                    const rank = index + 1;

                                    return (
                                        <tr
                                            key={entry.student_id}
                                            className={`transition-colors ${isCurrentUser
                                                ? 'bg-rose-500/10 hover:bg-rose-500/15'
                                                : 'hover:bg-(--hover-bg)'
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {rank <= 3 ? (
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                            rank === 1 ? 'bg-yellow-500/20' :
                                                            rank === 2 ? 'bg-gray-400/20' :
                                                            'bg-amber-600/20'
                                                        }`}>
                                                            <Trophy
                                                                className={`w-4 h-4 ${
                                                                    rank === 1 ? 'text-yellow-500' :
                                                                    rank === 2 ? 'text-gray-400' :
                                                                    'text-amber-600'
                                                                }`}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-(--text-primary)">
                                                            {rank}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${isCurrentUser ? 'text-rose-500' : 'text-(--text-primary)'}`}>
                                                        {entry.display_name || 'Anonymous'}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-500 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-(--text-primary) hidden sm:table-cell">
                                                {entry.batch || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-(--text-primary) hidden md:table-cell">
                                                {entry.branch || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`text-lg font-bold ${
                                                    entry.cgpa >= 9 ? 'text-yellow-500' :
                                                    entry.cgpa >= 8 ? 'text-rose-500' :
                                                    entry.cgpa >= 7 ? 'text-purple-500' :
                                                    'text-(--text-primary)'
                                                }`}>
                                                    {entry.cgpa.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-(--card-bg) border border-(--card-border) rounded-xl p-12 text-center animate-fade-in-up stagger-4">
                    <div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
                        <Users className="w-10 h-10 text-(--text-muted)" />
                    </div>
                    <h2 className="text-xl font-semibold text-(--text-primary) mb-2">
                        {hasActiveFilters ? 'No Matching Participants' : 'No Participants Yet'}
                    </h2>
                    <p className="text-(--text-secondary) max-w-md mx-auto">
                        {hasActiveFilters
                            ? 'Try adjusting your filters or clear them to see all participants.'
                            : 'Be the first to opt-in and share this platform with your classmates!'
                        }
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-center text-(--text-muted) mt-6">
                Rankings are based on voluntarily submitted data and do not represent official academic standings.
            </p>
        </div>
    );
}
