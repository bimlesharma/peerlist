'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LazyImageProps {
    src: string | null;
    alt: string;
    width: number;
    height: number;
    className?: string;
    fallback?: string;
}

export function LazyImage({ src, alt, width, height, className = '', fallback }: LazyImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const imageSrc = src && !hasError ? src : fallback;

    if (!imageSrc) {
        return (
            <div
                className={`bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center ${className}`}
                style={{ width: `${width}px`, height: `${height}px` }}
            >
                <span className="text-white text-lg font-bold">
                    {alt.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
            {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-secondary animate-pulse" />
            )}
            <Image
                src={imageSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
                className="w-full h-full object-cover"
            />
        </div>
    );
}
