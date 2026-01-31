'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import {
    GraduationCap,
    LayoutDashboard,
    Trophy,
    Users,
    Settings,
    LogOut,
    Sun,
    Moon,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/rankboard', label: 'Rankboard', icon: Trophy },
    { href: '/peers', label: 'Peers', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{color: 'var(--primary)'}}>
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">PeerList</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--hover-bg)] transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--card-border)] animate-fade-in">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--hover-bg)] transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
