'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Student } from '@/types';
import { Trophy, Lock, Users, Filter, Loader2, X } from 'lucide-react';
import Link from 'next/link';

interface RankboardEntry {
    id: string;
    display_name: string;
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Rankboard Access
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                        To view and participate in the rankboard, you need to share your academic data.
                        This is a fair-trade model: you share to see, others share to be seen.
                    </p>

                    <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] mb-6 text-left">
                        <h3 className="font-medium text-[var(--text-primary)] mb-2">
                            What happens when you opt in:
                        </h3>
                        <ul className="text-sm text-[var(--text-secondary)] space-y-2">
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

                    <p className="text-xs text-[var(--text-muted)] mt-4">
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Rankboard
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {filteredData.length} participant{filteredData.length !== 1 ? 's' : ''}
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
                <Link href="/settings" className="text-sm text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                    Manage participation →
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-6 animate-fade-in-up stagger-1">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Filters:</span>
                    </div>

                    {batches.length > 0 && (
                        <select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-rose-500 focus:outline-none transition-colors"
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
                            className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-rose-500 focus:outline-none transition-colors"
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
                            className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-rose-500 focus:outline-none transition-colors"
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
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Rankboard Table */}
            {filteredData.length > 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden animate-fade-in-up stagger-2">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--card-border)] bg-[var(--secondary)]">
                                    <th className="w-20 px-4 py-4 text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Rank</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider hidden sm:table-cell">Batch</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider hidden md:table-cell">Branch</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">CGPA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {filteredData.map((entry, index) => {
                                    const isCurrentUser = entry.id === currentUserId;
                                    const rank = index + 1;

                                    return (
                                        <tr
                                            key={entry.id}
                                            className={`transition-colors ${isCurrentUser
                                                ? 'bg-rose-500/10 hover:bg-rose-500/15'
                                                : 'hover:bg-[var(--hover-bg)]'
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
                                                        <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
                                                            {rank}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${isCurrentUser ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                                                        {entry.display_name}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-500 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[var(--text-primary)] hidden sm:table-cell">
                                                {entry.batch || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[var(--text-primary)] hidden md:table-cell">
                                                {entry.branch || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`text-lg font-bold ${
                                                    entry.cgpa >= 9 ? 'text-yellow-500' :
                                                    entry.cgpa >= 8 ? 'text-rose-500' :
                                                    entry.cgpa >= 7 ? 'text-purple-500' :
                                                    'text-[var(--text-primary)]'
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
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-12 text-center animate-fade-in-up stagger-3">
                    <div className="p-4 rounded-full bg-[var(--secondary)] w-fit mx-auto mb-4">
                        <Users className="w-10 h-10 text-[var(--text-muted)]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        {hasActiveFilters ? 'No Matching Participants' : 'No Participants Yet'}
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto">
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
            <p className="text-xs text-center text-[var(--text-muted)] mt-6">
                Rankings are based on voluntarily submitted data and do not represent official academic standings.
            </p>
        </div>
    );
}
