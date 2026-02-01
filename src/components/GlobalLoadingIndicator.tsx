'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Global loading indicator for navigation
 * Shows when page navigation is in progress
 */
export function GlobalLoadingIndicator() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Track navigation using beforeunload
        const handleBeforeUnload = () => {
            setIsNavigating(true);
        };

        // Reset after page loads
        const handleLoad = () => {
            setIsNavigating(false);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('load', handleLoad);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (!isNavigating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 animate-pulse" />
    );
}
