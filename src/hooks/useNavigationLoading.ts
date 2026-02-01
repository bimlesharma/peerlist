import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for managing loading state during navigation
 * Prevents double-clicks and provides visual feedback
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

    return {
        navigate,
        navigateReplace,
        refresh,
        isPending,
    };
}
