'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ChartSkeleton } from './SkeletonLoader';

// Dynamically import heavy chart components
const SGPATrendChartDynamic = dynamic(
    () => import('@/components/PerformanceCharts').then(mod => ({ default: mod.SGPATrendChart })),
    { loading: () => <ChartSkeleton /> }
);

const GradeDistributionChartDynamic = dynamic(
    () => import('@/components/PerformanceCharts').then(mod => ({ default: mod.GradeDistributionChart })),
    { loading: () => <ChartSkeleton /> }
);

const SubjectRadarChartDynamic = dynamic(
    () => import('@/components/PerformanceCharts').then(mod => ({ default: mod.SubjectRadarChart })),
    { loading: () => <ChartSkeleton /> }
);

const SemesterMarksChartDynamic = dynamic(
    () => import('@/components/PerformanceCharts').then(mod => ({ default: mod.SemesterMarksChart })),
    { loading: () => <ChartSkeleton /> }
);

const SubjectMarksStackedBarChartDynamic = dynamic(
    () => import('@/components/SubjectMarksStackedBarChart').then(mod => ({ default: mod.SubjectMarksStackedBarChart })),
    { loading: () => <ChartSkeleton /> }
);

export {
    SGPATrendChartDynamic as SGPATrendChart,
    GradeDistributionChartDynamic as GradeDistributionChart,
    SubjectRadarChartDynamic as SubjectRadarChart,
    SemesterMarksChartDynamic as SemesterMarksChart,
    SubjectMarksStackedBarChartDynamic as SubjectMarksStackedBarChart,
};
