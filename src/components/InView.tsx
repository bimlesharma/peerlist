'use client';

import { useEffect, useRef, useState } from 'react';
import { ReactNode } from 'react';

interface InViewProps {
    children: ReactNode;
    className?: string;
    threshold?: number;
    fallback?: ReactNode;
}

export function InView({ children, className = '', threshold = 0.1, fallback }: InViewProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [threshold]);

    return (
        <div ref={ref} className={className}>
            {isInView ? children : fallback}
        </div>
    );
}
