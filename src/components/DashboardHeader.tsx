'use client';

import { RefreshCw, User } from 'lucide-react';
import { useState } from 'react';

interface DashboardHeaderProps {
    studentName: string;
    enrollmentNo: string;
    institute: string;
    program: string;
    batch?: string;
    profileImage?: string;
    onRefresh: () => void;
}

export function DashboardHeader({
    studentName,
    enrollmentNo,
    institute,
    program,
    batch,
    profileImage,
    onRefresh
}: DashboardHeaderProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="bg-background pt-4 sm:pt-10 pb-4 sm:pb-6 border-b border-(--card-border) transition-colors duration-300">
            {/* Mobile Layout */}
            <div className="sm:hidden">
                <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                    {/* Profile Image - Mobile */}
                    <div className="shrink-0">
                        {profileImage ? (
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-linear-to-r from-rose-500 to-pink-500 rounded-xl blur opacity-30" />
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-rose-500/30">
                                    <img src={profileImage} alt={studentName} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-linear-to-r from-rose-500 to-pink-500 rounded-xl blur opacity-20" />
                                <div className="relative w-14 h-14 rounded-xl bg-linear-to-br from-rose-500/20 to-rose-600/10 border-2 border-rose-500/30 flex items-center justify-center">
                                    <User className="w-6 h-6 text-rose-500/50" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Name & Enrollment - Mobile */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-black text-(--text-primary) uppercase tracking-tight truncate">
                            {studentName}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-(--text-secondary)">{enrollmentNo}</span>
                            <button
                                onClick={handleRefresh}
                                className="p-1.5 rounded-md border border-(--card-border) text-(--text-muted) hover:text-rose-400 hover:border-rose-500/50 transition-all"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details - Mobile (Compact) */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary rounded-lg p-2 border border-(--card-border)">
                        <div className="text-[8px] font-bold text-(--text-muted) uppercase tracking-wide">Program</div>
                        <div className="text-[10px] font-bold text-(--text-primary) mt-0.5 truncate">{program.split(' ').slice(0, 2).join(' ')}</div>
                    </div>
                    <div className="bg-secondary rounded-lg p-2 border border-(--card-border)">
                        <div className="text-[8px] font-bold text-(--text-muted) uppercase tracking-wide">Institute</div>
                        <div className="text-[10px] font-bold text-(--text-primary) mt-0.5 truncate">{institute.split(' ').slice(0, 2).join(' ')}</div>
                    </div>
                    {batch && (
                        <div className="bg-secondary rounded-lg p-2 border border-(--card-border)">
                            <div className="text-[8px] font-bold text-(--text-muted) uppercase tracking-wide">Batch</div>
                            <div className="text-[10px] font-bold text-(--text-primary) mt-0.5">{batch}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <div className="flex flex-row justify-between items-start md:items-center gap-6 mb-8">
                    {/* Left Section: Name, Enrollment & Actions */}
                    <div className="flex-1 text-left animate-fade-in-up">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-(--text-primary) uppercase tracking-tight mb-2 wrap-break-words">
                            {studentName}
                        </h1>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="animate-fade-in-up stagger-2">
                                <div className="text-xl md:text-2xl font-bold text-(--text-secondary) tracking-wider">{enrollmentNo}</div>
                                <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-1">Enrollment No.</div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="p-2 rounded-lg border border-(--card-border) bg-transparent hover:bg-rose-500/10 hover:border-rose-500/50 text-(--text-muted) hover:text-rose-400 transition-all duration-300 ripple btn-shine"
                                title="Refresh Results"
                            >
                                <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Right Section: Profile Image */}
                    <div className="shrink-0 animate-scale-in">
                        {profileImage ? (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300" />
                                <div className="relative w-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 rounded-2xl overflow-hidden border-2 border-rose-500/30 shadow-lg shadow-rose-500/10 transition-transform duration-300 group-hover:scale-105">
                                    <img src={profileImage} alt={studentName} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                                <div className="relative w-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 rounded-2xl bg-linear-to-br from-rose-500/20 to-rose-600/10 border-2 border-rose-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                    <User className="w-10 md:w-12 h-10 md:h-12 text-rose-500/50" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Grid - Desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-4 text-sm">
                    <div className="animate-fade-in-up stagger-3 group text-left">
                        <div className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-2 group-hover:text-rose-400 transition-colors">Institute</div>
                        <div className="font-bold text-(--text-primary) text-base leading-tight">{institute}</div>
                    </div>
                    <div className="animate-fade-in-up stagger-4 group text-left">
                        <div className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-2 group-hover:text-rose-400 transition-colors">Program</div>
                        <div className="font-bold text-(--text-primary) text-base leading-tight">{program}</div>
                    </div>
                    {batch && (
                        <div className="animate-fade-in-up stagger-5 group text-left col-span-2 md:col-span-1">
                            <div className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-2 group-hover:text-rose-400 transition-colors">Year of Admission</div>
                            <div className="font-bold text-(--text-primary) text-base">{batch}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
