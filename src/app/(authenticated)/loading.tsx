import { HeaderSkeleton, GridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <HeaderSkeleton />
            <GridSkeleton count={6} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <TableSkeleton />
        </div>
    );
}
