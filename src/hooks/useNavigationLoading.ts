import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for managing loading state during navigation
 * Prevents double-clicks and provides visual feedback
 * Includes prefetching for faster navigation
 */
export function useNavigationLoading() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const navigate = (href: string) => {
        startTransition(() => {
            router.push(href);
        });
    };

    const navigateReplace = (href: string) => {
        startTransition(() => {
            router.replace(href);
        });
    };

    const refresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const prefetch = (href: string) => {
        router.prefetch(href);
    };

    return {
        navigate,
        navigateReplace,
        refresh,
        prefetch,
        isPending,
    };
}
