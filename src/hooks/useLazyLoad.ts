import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
    threshold?: number | number[];
    rootMargin?: string;
}

/**
 * Hook for lazy loading content when it enters the viewport
 * Returns { ref, isInView } - attach ref to the element you want to lazy load
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}) {
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
            {
                threshold: options.threshold ?? 0.1,
                rootMargin: options.rootMargin ?? '50px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return { ref, isInView };
}

/**
 * Hook for tracking when an element is in the viewport
 * Keeps updating isInView as element enters/leaves viewport
 */
export function useInViewport(options: UseLazyLoadOptions = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting);
            },
            {
                threshold: options.threshold ?? 0.1,
                rootMargin: options.rootMargin ?? '0px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return { ref, isInViewport };
}
