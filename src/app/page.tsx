'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    GraduationCap,
    BarChart3,
    Users,
    Shield,
    TrendingUp,
    PieChart,
    Zap,
    ArrowRight,
    Loader2,
    Info,
    AlertTriangle,
    ChevronDown,
    Github
} from 'lucide-react';

export default function LandingPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const handleGitHubSignIn = async () => {
        setLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const features = [
        {
            icon: BarChart3,
            title: 'Visual Analytics',
            description: 'Interactive charts and graphs for your academic performance'
        },
        {
            icon: TrendingUp,
            title: 'GPA Tracking',
            description: 'Track your SGPA and CGPA trends across semesters'
        },
        {
            icon: PieChart,
            title: 'Grade Distribution',
            description: 'See your grade distribution with beautiful visualizations'
        },
        {
            icon: Users,
            title: 'Peer Comparison',
            description: 'Opt-in to compare with anonymized batch rankings'
        },
        {
            icon: Zap,
            title: 'Fast & Responsive',
            description: 'Optimized for all devices - mobile, tablet, and desktop'
        },
        {
            icon: Shield,
            title: 'Privacy First',
            description: 'Your data, your control. Full consent management'
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] overflow-x-hidden transition-colors duration-300">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Section */}
            <div className="relative min-h-screen flex flex-col">
                {/* Header */}
                <header className="w-full py-4 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">PeerList<span className="text-rose-500">.</span></span>
                        </div>
                        <button
                            onClick={() => setShowDisclaimer(!showDisclaimer)}
                            className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-rose-400 transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            <span className="hidden sm:inline">Disclaimer</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 sm:px-6 lg:px-8 py-8">
                    {/* Left Side - Info */}
                    <div className="w-full max-w-lg text-center lg:text-left animate-fade-in-up">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 leading-tight">
                            Your Results,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                                Reimagined
                            </span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base lg:text-lg mb-8">
                            A modern, privacy-first platform for viewing your GGSIPU examination results with detailed analytics, peer comparisons, and insights.
                        </p>

                        {/* Features Grid - Hidden on mobile, shown on lg */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            {features.slice(0, 4).map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-[var(--hover-bg)] border border-[var(--card-border)] hover:border-rose-500/30 transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] text-sm">{feature.title}</h3>
                                        <p className="text-[var(--text-muted)] text-xs mt-0.5">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Sign In Card */}
                    <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-[var(--secondary)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6">
                            <div className="text-center">
                                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Get Started</h2>
                                <p className="text-[var(--text-muted)] text-sm mt-1">Sign in to access your analytics</p>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-[var(--text-primary)] text-sm">IPU Verification Required</h4>
                                        <p className="text-[var(--text-muted)] text-xs mt-1">
                                            After signing in, you&apos;ll verify with your official IPU portal credentials to fetch your authentic results.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <button
                                onClick={handleGitHubSignIn}
                                disabled={loading}
                                className="w-full py-3 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 btn-shine ripple"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Github className="w-5 h-5" />
                                        Sign in with GitHub
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {/* Privacy Note */}
                            <p className="text-center text-[var(--text-muted)] text-xs">
                                <Shield className="w-3 h-3 inline mr-1" />
                                Your academic data stays private by default
                            </p>
                        </div>
                    </div>
                </main>

                {/* Scroll Indicator */}
                <div className="flex justify-center pb-6 lg:hidden animate-bounce">
                    <ChevronDown className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
            </div>

            {/* Features Section - Mobile */}
            <section className="lg:hidden py-12 px-4 sm:px-6 bg-[var(--card-bg)] border-t border-[var(--card-border)]">
                <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-6">Features</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="flex flex-col items-center text-center p-4 rounded-xl bg-[var(--secondary)] border border-[var(--card-border)]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-2">
                                    <feature.icon className="w-5 h-5 text-rose-500" />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] text-xs">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] text-[10px] mt-1 leading-tight">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Disclaimer Modal */}
            {showDisclaimer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDisclaimer(false)}>
                    <div className="bg-[var(--secondary)] border border-[var(--card-border)] rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Disclaimer & Privacy</h3>
                        </div>

                        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                            <div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Data Privacy</h4>
                                <p>Your IPU credentials are <span className="text-rose-400 font-semibold">NEVER</span> stored on our servers. They are transmitted directly to official IPU servers for authentication and result fetching.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Consent-Driven</h4>
                                <p>All features are opt-in. You control what data is used for analytics, peer comparisons, and rankings.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Data Source</h4>
                                <p>All academic data is fetched directly from the official IPU result portal. We do not modify any academic information.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">No Affiliation</h4>
                                <p>This platform is <span className="text-rose-400 font-semibold">NOT</span> officially affiliated with Guru Gobind Singh Indraprastha University. It is an independent project created to enhance the student experience.</p>
                            </div>

                            <div className="pt-4 border-t border-[var(--card-border)]">
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Your Rights</h4>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Export all your data anytime</li>
                                    <li>Delete your account and data completely</li>
                                    <li>Control visibility in rankings</li>
                                    <li>Revoke consents at any time</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDisclaimer(false)}
                            className="w-full mt-6 py-2 px-4 bg-[var(--card-bg)] hover:bg-[var(--hover-bg)] border border-[var(--card-border)] text-[var(--text-primary)] font-medium rounded-lg transition-colors text-sm"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-6 px-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                        Made with <span className="text-rose-500">♥</span> for GGSIPU Students
                    </p>
                    <p className="text-[var(--text-muted)] text-[10px] sm:text-xs mt-1">
                        Not affiliated with Guru Gobind Singh Indraprastha University
                    </p>
                </div>
            </footer>
        </div>
    );
}
