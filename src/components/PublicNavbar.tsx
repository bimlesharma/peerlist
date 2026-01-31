'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X, Github, Loader2, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/data-protection', label: 'Data Protection' },
    { href: '/platform-architecture', label: 'Platform Architecture' },
];

export function PublicNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const supabase = createClient();
    const { theme, toggleTheme } = useTheme();

    const handleGitHubSignIn = async () => {
        setLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-[var(--card-border)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{color: 'var(--primary)'}}>
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-pink-600">ListPeers</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-rose-500 bg-opacity-10 text-rose-500'
                                            : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg)'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <a
                            href="https://github.com/bimlesharma/listpeers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg) transition-colors"
                        >
                            Source Code
                        </a>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg) transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={handleGitHubSignIn}
                            disabled={loading}
                            className="ml-2 flex items-center gap-2 px-4 py-2 bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Github className="w-4 h-4" />
                            )}
                            Sign In
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg)"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--card-border)] animate-fade-in">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-rose-500 bg-opacity-10 text-rose-500'
                                                : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg)'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <a
                                href="https://github.com/bimlesharma/listpeers"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg) transition-colors"
                            >
                                Source Code
                            </a>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--hover-bg) transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <Sun className="w-5 h-5" />
                                        Light Mode
                                    </>
                                ) : (
                                    <>
                                        <Moon className="w-5 h-5" />
                                        Dark Mode
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleGitHubSignIn();
                                }}
                                disabled={loading}
                                className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Github className="w-4 h-4" />
                                )}
                                Sign In
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
