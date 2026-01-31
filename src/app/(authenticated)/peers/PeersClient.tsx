'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Student } from '@/types';
import { Users, Lock, Loader2, Search, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getMaskedIdentity, getPseudonymAvatarColor, type DisplayMode } from '@/lib/privacy';

interface PeerData {
    id: string;
    display_name: string | null;
    batch: string | null;
    branch: string | null;
    college: string | null;
    avatar_url: string | null;
    enrollment_no: string;
    display_mode: DisplayMode;
}

interface PeersClientProps {
    student: Student;
    peersData: PeerData[];
}

export function PeersClient({ student, peersData }: PeersClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter peers based on search
    const filteredPeers = peersData.filter(peer => {
        const query = searchQuery.toLowerCase();
        return (
            peer.display_name?.toLowerCase().includes(query) ||
            peer.branch?.toLowerCase().includes(query) ||
            peer.college?.toLowerCase().includes(query)
        );
    });

    const handleOptIn = async () => {
        setLoading(true);
        try {
            await supabase
                .from('students')
                .update({ marks_visibility: true, marks_visibility_at: new Date().toISOString() })
                .eq('id', student.id);

            router.refresh();
        } catch (err) {
            console.error('Opt-in error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Not opted in - show gate
    if (!student.marks_visibility) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-center animate-fade-in-up">
                    <div className="p-4 rounded-full bg-rose-500/10 w-fit mx-auto mb-4">
                        <Lock className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Peers Access
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                        To view your classmates' detailed academic results, you need to share your marks too.
                        This is a fair-trade model: you share to see, others share to be seen.
                    </p>

                    <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] mb-6 text-left">
                        <h3 className="font-medium text-[var(--text-primary)] mb-2">
                            What happens when you opt in:
                        </h3>
                        <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                Your detailed marks become visible to other opted-in students
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                You can see other opted-in students' detailed results
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500">✓</span>
                                Compare subject-wise performance with classmates
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
                        className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mx-auto disabled:opacity-50 shadow-lg shadow-rose-500/20 transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Opting in...
                            </>
                        ) : (
                            <>
                                <Users className="w-5 h-5" />
                                Share My Marks & View Peers
                            </>
                        )}
                    </button>

                    <p className="text-xs text-[var(--text-muted)] mt-4">
                        By opting in, you agree to share your detailed academic marks with other opted-in students.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Peers
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {filteredPeers.length} classmate{filteredPeers.length !== 1 ? 's' : ''} sharing marks
                    </p>
                </div>
                <Link href="/settings" className="text-sm text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                    Manage sharing →
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6 animate-fade-in-up stagger-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                    type="text"
                    placeholder="Search by name, enrollment, branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-rose-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Peers Grid */}
            {filteredPeers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up stagger-2">
                    {filteredPeers.map((peer) => {
                        const maskedIdentity = getMaskedIdentity(
                            peer.display_mode,
                            peer.enrollment_no,
                            peer.display_name
                        );
                        const pseudonymColor = peer.display_mode !== 'visible' 
                            ? getPseudonymAvatarColor(maskedIdentity.displayName)
                            : 'bg-rose-500';

                        return (
                            <Link
                                key={peer.id}
                                href={`/peers/${peer.id}`}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 hover:border-rose-500/50 transition-all group"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    {maskedIdentity.showAvatar && peer.avatar_url ? (
                                        <img
                                            src={peer.avatar_url}
                                            alt={peer.display_name || 'Student'}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-rose-500/30"
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full ${pseudonymColor} flex items-center justify-center border-2 border-opacity-30 border-gray-300`}>
                                            <span className="text-xs font-bold text-white">
                                                {maskedIdentity.avatarFallback}
                                            </span>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-rose-500 transition-colors">
                                                {maskedIdentity.displayName}
                                            </h3>
                                            {peer.display_mode !== 'visible' && (
                                                <div title={`Privacy mode: ${peer.display_mode}`} className="flex-shrink-0">
                                                    <Lock className="w-3 h-3 text-[var(--text-muted)] opacity-70" />
                                                </div>
                                            )}
                                            <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {peer.branch && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                                                {peer.branch}
                                            </p>
                                        )}
                                        {peer.batch && (
                                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500 rounded-full">
                                                {peer.batch}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-12 text-center animate-fade-in-up stagger-2">
                    <div className="p-4 rounded-full bg-[var(--secondary)] w-fit mx-auto mb-4">
                        <Users className="w-10 h-10 text-[var(--text-muted)]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        {searchQuery ? 'No Matches Found' : 'No Peers Yet'}
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                        {searchQuery
                            ? 'Try adjusting your search query.'
                            : 'Be the first to share! Invite your classmates to join and share their marks.'
                        }
                    </p>
                </div>
            )}

            {/* Info */}
            <p className="text-xs text-center text-[var(--text-muted)] mt-6">
                Only students who have opted to share their marks are visible here.
            </p>
        </div>
    );
}
