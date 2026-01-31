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
    Loader2,
    ChevronDown,
    Github,
    Eye,
    Trash2,
    Settings,
    Code,
    Heart,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function LandingPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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
            title: 'Peer Network',
            description: 'Connect with classmates and compare academic progress'
        },
        {
            icon: Shield,
            title: 'Privacy First',
            description: 'Full control over what data is shared and with whom'
        },
        {
            icon: Zap,
            title: 'Real-time Data',
            description: 'On-demand import from official IPU result systems'
        }
    ];

    const faqs = [
        {
            question: 'Where does my data come from?',
            answer: 'All academic data displayed is fetched on-demand and one-time only from official Guru Gobind Singh Indraprastha University (GGSIPU) result systems, after explicit user authorization. The platform is designed to respect responsible and non-abusive use of university infrastructure. We do not modify, store, or tamper with any academic information. Your credentials are never stored on our servers.'
        },
        {
            question: 'Is my enrollment number visible to other students?',
            answer: 'No. Your enrollment number is never displayed to other students. Based on your privacy settings, you can choose to appear as "Anonymous", "Pseudonymous" (as Student-XXXXXX), or "Visible" (with your name) to peers in the same college.'
        },
        {
            question: 'Can I opt-out of features?',
            answer: 'Yes. All features are opt-in. You can control whether your marks are shared with peers, whether you appear in rankings, and whether your data is used for analytics. You can change these preferences anytime in Settings.'
        },
        {
            question: 'How is my CGPA calculated?',
            answer: 'CGPA (Cumulative GPA) is calculated using the credit-weighted average: CGPA = Σ(Grade Points × Credits) / Σ(Credits) across all semesters. This follows the standard academic calculation method.'
        },
        {
            question: 'Can I delete my account and data?',
            answer: 'Yes. You have the right to delete your account completely at any time. This will permanently remove all your data from our servers. Once deleted, this action cannot be reversed.'
        },
        {
            question: 'Is this an official GGSIPU platform?',
            answer: 'No. This is NOT an official platform of Guru Gobind Singh Indraprastha University. It is an independent, student-run open-source project created to enhance the student experience. We are not affiliated with or endorsed by the university.'
        },
        {
            question: 'How is my data protected?',
            answer: 'We use industry-standard security practices including: encrypted connections (HTTPS/TLS), Row-Level Security (RLS) in the database, and compliance with GDPR/data protection regulations. Your credentials are never stored and are transmitted only to official IPU servers.'
        },
        {
            question: 'What is the minimum cohort size for rankings?',
            answer: 'The rankboard only shows when at least 2 students from the same college, batch, and branch have enabled ranking consent. This ensures privacy and prevents identification.'
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--bg)] via-[var(--bg)] to-[var(--secondary)]/30">
                {/* Animated gradient background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-24">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 backdrop-blur-sm hover:border-rose-500/50 transition-colors">
                            <span className="text-rose-500 text-sm font-semibold flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Student-Run • Open Source • Fully Transparent
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[var(--text-primary)] mb-6 leading-tight">
                            Your Academic Performance,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500">
                                Your Control
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto leading-relaxed">
                            Privacy-first academic analytics platform for GGSIPU students. Connect with peers, track your CGPA, and control exactly what data you share.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center justify-center mb-16">
                            <button
                                onClick={handleGitHubSignIn}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Github className="w-5 h-5" />
                                )}
                                Sign In with GitHub
                            </button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-[var(--text-muted)] pt-8 border-t border-[var(--card-border)]">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>End-to-end Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>Row-Level Security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>Audit Logs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {features.map((feature, i) => (
                        <div key={i} className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] hover:border-rose-500/30 transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)]">{feature.title}</h3>
                                    <p className="text-[var(--text-muted)] text-sm mt-1">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Account Control Section */}
            <section className="bg-[var(--secondary)] border-y border-[var(--card-border)] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-rose-500" />
                        Account & Data Management
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                <Settings className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Manage Consents</h3>
                            <p className="text-[var(--text-muted)] text-sm">Control which features you participate in: analytics, rankings, peer sharing, and identity visibility.</p>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                                <Eye className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Privacy Modes</h3>
                            <p className="text-[var(--text-muted)] text-sm">Choose how you appear to peers: Anonymous, Pseudonymous (hashed ID), or Visible (with your name).</p>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Delete Account</h3>
                            <p className="text-[var(--text-muted)] text-sm">Permanently delete your account and all associated data. This action cannot be reversed.</p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 rounded-lg bg-[var(--bg)] border border-[var(--card-border)]">
                        <h3 className="font-bold text-[var(--text-primary)] mb-3">Audit Log</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-3">All consent changes are logged immutably for transparency and compliance.</p>
                        <div className="text-xs text-[var(--text-muted)] space-y-1">
                            <div>✓ Date and time of each consent change</div>
                            <div>✓ What was changed (analytics, rankings, etc.)</div>
                            <div>✓ Whether it was granted or revoked</div>
                            <div>✓ Complete immutable history</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-rose-500" />
                    Frequently Asked Questions
                </h2>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-lg border border-[var(--card-border)] bg-[var(--secondary)] overflow-hidden">
                            <button
                                onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--card-bg)] transition-colors"
                            >
                                <h3 className="text-[var(--text-primary)] font-semibold text-left">{faq.question}</h3>
                                <ChevronDown className={`w-5 h-5 text-rose-500 transition-transform ${expandedFAQ === i ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedFAQ === i && (
                                <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
                                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Source & Compliance Section */}
            <section className="bg-gradient-to-r from-rose-500/10 to-pink-600/10 border-y border-rose-500/20 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <Code className="w-6 h-6 text-rose-500" />
                                Open Source & Transparent
                            </h2>
                            <p className="text-[var(--text-muted)] mb-4">PeerList is completely open source. Our code is publicly available for review and contribution. We believe in transparency and community-driven development.</p>
                            <a
                                href="https://github.com/bimlesh1/peerlist"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                View on GitHub
                            </a>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <Heart className="w-6 h-6 text-rose-500" />
                                Student-Run Initiative
                            </h2>
                            <p className="text-[var(--text-muted)] mb-4">Built by GGSIPU students, for GGSIPU students. We understand the platform's limitations and created this to make academic tracking easier, fairer, and more transparent.</p>
                            <p className="text-[var(--text-muted)] text-sm">No corporate interests. No hidden agendas. Just students helping students.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3">Compliance</h3>
                            <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                                <li>✓ GDPR Compliant</li>
                                <li>✓ Aligned with Indian data protection frameworks</li>
                                <li>✓ Data Protection Act aligned</li>
                                <li>✓ No unauthorized data retention</li>
                                <li>✓ Transparent privacy policies</li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3">Technology & Security</h3>
                            <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                                <li>✓ End-to-end encrypted connections (TLS)</li>
                                <li>✓ Row-Level Security (RLS) in database</li>
                                <li>✓ Server-side validation</li>
                                <li>✓ Immutable audit logs</li>
                                <li>✓ Regular security updates</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Academic Journey?</h2>
                    <p className="text-white/90 mb-6 text-lg">Sign in with GitHub and start tracking your performance with complete privacy and transparency.</p>
                    <button
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-white text-rose-600 font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Github className="w-5 h-5" />
                        )}
                        Sign In with GitHub
                    </button>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
