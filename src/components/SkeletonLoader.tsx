'use client';

import { cn } from '@/lib/utils';

export function SkeletonLoader({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-secondary via-secondary to-secondary',
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-(--card-bg) border border-(--card-border) rounded-xl p-6 animate-pulse">
            <div className="space-y-4">
                <SkeletonLoader className="h-4 w-32 rounded" />
                <SkeletonLoader className="h-8 w-20 rounded" />
                <SkeletonLoader className="h-4 w-full rounded" />
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-(--card-bg) border border-(--card-border) rounded-xl p-6 animate-pulse">
            <SkeletonLoader className="h-6 w-40 rounded mb-4" />
            <SkeletonLoader className="h-64 w-full rounded" />
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="bg-(--card-bg) border border-(--card-border) rounded-xl overflow-hidden animate-pulse">
            <div className="p-4 border-b border-(--card-border) space-y-2">
                <SkeletonLoader className="h-8 w-full rounded" />
            </div>
            <div className="divide-y divide-(--card-border)">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                        <SkeletonLoader className="h-6 w-full rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HeaderSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <SkeletonLoader className="h-8 w-48 rounded" />
            <SkeletonLoader className="h-4 w-64 rounded" />
        </div>
    );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
