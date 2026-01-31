'use client';

import { useCursorPosition } from '@/contexts/CursorContext';
import { useEffect, useRef } from 'react';

export function GlobalCursorEffect() {
    const cursorPos = useCursorPosition();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
            {/* Primary glow - rose */}
            <div
                className="absolute w-48 h-48 rounded-full blur-2xl opacity-10"
                style={{
                    background: 'radial-gradient(circle, rgba(244, 63, 94, 0.4), transparent)',
                    left: `${cursorPos.x - 96}px`,
                    top: `${cursorPos.y - 96}px`,
                    transition: 'all 0.08s ease-out',
                }}
            />
            {/* Secondary glow - pink */}
            <div
                className="absolute w-32 h-32 rounded-full blur-xl opacity-8"
                style={{
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)',
                    left: `${cursorPos.x - 64}px`,
                    top: `${cursorPos.y - 64}px`,
                    transition: 'all 0.1s ease-out',
                }}
            />
        </div>
    );
}
