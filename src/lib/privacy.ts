/**
 * Privacy utility functions for masking user identity based on display_mode
 */

export type DisplayMode = 'anonymous' | 'pseudonymous' | 'visible';

export interface MaskedIdentity {
    displayName: string;
    showAvatar: boolean;
    avatarFallback: string;
}

/**
 * Get masked identity based on display_mode
 * @param displayMode - User's chosen display mode
 * @param enrollmentNo - User's enrollment number (for pseudonymous hashing)
 * @param realName - User's real name
 * @returns Masked identity info
 */
export function getMaskedIdentity(
    displayMode: DisplayMode,
    enrollmentNo: string,
    realName?: string | null
): MaskedIdentity {
    switch (displayMode) {
        case 'anonymous':
            return {
                displayName: 'Anonymous',
                showAvatar: false,
                avatarFallback: 'Anon',
            };

        case 'pseudonymous':
            // Create deterministic pseudonym from enrollment number
            const pseudonym = createPseudonym(enrollmentNo);
            return {
                displayName: pseudonym,
                showAvatar: false,
                avatarFallback: pseudonym.substring(0, 2),
            };

        case 'visible':
            return {
                displayName: realName || 'Student',
                showAvatar: true,
                avatarFallback: realName?.substring(0, 2).toUpperCase() || 'ST',
            };

        default:
            return {
                displayName: 'Student',
                showAvatar: false,
                avatarFallback: 'ST',
            };
    }
}

/**
 * Create a deterministic pseudonym from enrollment number
 * E.g., "123456789" becomes "Student-7890" (last 4 digits)
 */
function createPseudonym(enrollmentNo: string): string {
    const lastFour = enrollmentNo.slice(-4);
    return `Student-${lastFour}`;
}

/**
 * Get avatar color class based on pseudonym
 */
export function getPseudonymAvatarColor(pseudonym: string): string {
    const colors = [
        'bg-rose-500',
        'bg-pink-500',
        'bg-purple-500',
        'bg-blue-500',
        'bg-cyan-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-orange-500',
    ];

    // Deterministic color selection based on pseudonym
    const hash = pseudonym.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}
