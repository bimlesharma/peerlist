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
    ArrowDown,
    ArrowUp,
    ArrowLeftRight,
    Loader2,
    Info,
    AlertTriangle,
    ChevronDown,
    Github,
    Lock,
    Eye,
    Trash2,
    Settings,
    FileText,
    Code,
    Heart,
    BookOpen,
    Globe,
    Database
} from 'lucide-react';
import Link from 'next/link';

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
            {/* Navigation */}
            <nav className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-[var(--text-primary)] text-lg">PeerList</span>
                    </div>
                    <button
                        onClick={handleGitHubSignIn}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Github className="w-4 h-4" />
                        )}
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                <div className="text-center mb-12">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                        <span className="text-rose-500 text-xs font-semibold">🎓 Student-Run • Open Source • Fully Transparent</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        Your Academic Performance, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Your Control</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
                        Privacy-first academic analytics platform for GGSIPU students. Connect with peers, track your CGPA, and control exactly what data you share.
                    </p>
                </div>

                {/* Features Grid */}
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

            {/* System Design Section */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
                    <Code className="w-8 h-8 text-rose-500" />
                    System Design Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-rose-500" />
                            Internal Components
                        </h3>
                        <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Next.js App (UI): Landing, dashboard, peers, rankboard, settings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>API Routes: Secure proxy for IPU portal requests</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Supabase Database: Students, academic records, subjects, consent logs</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Row-Level Security & RPCs: Enforced privacy and scoped access</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" />
                            External Components
                        </h3>
                        <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>GGSIPU Result Systems: On-demand, one-time, user-authorized data source</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>GitHub OAuth: Authentication provider</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Supabase Auth: Session and identity management</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-rose-500" />
                        Data Flow Architecture
                    </h3>

                    <div className="mb-6 flex flex-wrap gap-3 text-xs">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500">
                            <ArrowDown className="w-3.5 h-3.5" />
                            Request Path
                        </span>
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                            <ArrowUp className="w-3.5 h-3.5" />
                            Response Path
                        </span>
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            Consent-Gated Data
                        </span>
                    </div>

                    {/* Layer 1: Client */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-lg border-2 border-rose-500/30 bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/30 w-full max-w-xs text-center">
                            <div className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400">Layer 1: Presentation</div>
                            <div className="font-bold text-[var(--text-primary)] mt-2 flex items-center justify-center gap-2">
                                <Globe className="w-5 h-5 text-rose-500" />
                                User Browser
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">Landing • Dashboard • Peers • Rankboard • Settings</div>
                        </div>
                    </div>

                    {/* Connection: Client -> App */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                                <ArrowDown className="w-4 h-4" />
                                HTTPS Request
                            </div>
                            <div className="h-6 w-0.5 bg-rose-500/40"></div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                                <ArrowUp className="w-4 h-4" />
                                Response
                            </div>
                        </div>
                    </div>

                    {/* Layer 2: Application */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 w-full max-w-xs text-center">
                            <div className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400">Layer 2: Application</div>
                            <div className="font-bold text-[var(--text-primary)] mt-2 flex items-center justify-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500" />
                                Next.js App
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-2 grid grid-cols-3 gap-2">
                                <div className="px-2 py-1 rounded bg-[var(--secondary)] border border-[var(--card-border)]">UI Pages</div>
                                <div className="px-2 py-1 rounded bg-[var(--secondary)] border border-[var(--card-border)]">API Routes</div>
                                <div className="px-2 py-1 rounded bg-[var(--secondary)] border border-[var(--card-border)]">Auth</div>
                            </div>
                        </div>
                    </div>

                    {/* Connection: App -> Data/Auth */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
                                <ArrowDown className="w-4 h-4" />
                                Secure API Call
                            </div>
                            <div className="h-6 w-0.5 bg-blue-500/40"></div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                                <ArrowUp className="w-4 h-4" />
                                Scoped Response
                            </div>
                        </div>
                    </div>

                    {/* Layer 3: Data & Auth */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Supabase - Left */}
                        <div className="p-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30 text-center">
                            <div className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400">Layer 3a: Authentication</div>
                            <div className="font-bold text-[var(--text-primary)] mt-2 flex items-center justify-center gap-2">
                                <Lock className="w-5 h-5 text-purple-500" />
                                Supabase Auth
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-2">
                                <div>GitHub OAuth</div>
                                <div>Session Management</div>
                            </div>
                        </div>

                        {/* Database - Right */}
                        <div className="p-4 rounded-lg border-2 border-amber-500/30 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/30 text-center">
                            <div className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Layer 3b: Data</div>
                            <div className="font-bold text-[var(--text-primary)] mt-2 flex items-center justify-center gap-2">
                                <Database className="w-5 h-5 text-amber-500" />
                                PostgreSQL DB
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-2">
                                <div>Students • Records</div>
                                <div>RLS • Triggers • RPCs</div>
                            </div>
                        </div>
                    </div>

                    {/* Consent-Gated Data Exchange */}
                    <div className="flex items-center justify-center mb-4 px-4">
                        <div className="flex items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1 text-blue-500">
                                <ArrowDown className="w-4 h-4" />
                                Consent Check
                            </span>
                            <ArrowLeftRight className="w-4 h-4 text-rose-500/60" />
                            <span className="inline-flex items-center gap-1 text-emerald-500">
                                <ArrowUp className="w-4 h-4" />
                                Data Response
                            </span>
                        </div>
                    </div>

                    {/* Connection: On-demand Import */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-green-500">
                                <ArrowDown className="w-4 h-4" />
                                On-demand & One-time (Authorized)
                            </div>
                            <div className="h-5 w-0.5 bg-green-500/40"></div>
                        </div>
                    </div>

                    {/* Layer 4: External Services */}
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 w-full max-w-xs text-center">
                            <div className="text-xs uppercase font-bold text-green-600 dark:text-green-400">Layer 4: External API</div>
                            <div className="font-bold text-[var(--text-primary)] mt-2 flex items-center justify-center gap-2">
                                <GraduationCap className="w-5 h-5 text-green-500" />
                                GGSIPU Result Systems
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">Official Results (fetched only when authorized)</div>
                        </div>
                    </div>

                    {/* Connection: Imported Data Return */}
                    <div className="flex justify-center mb-6">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-5 w-0.5 bg-green-500/40"></div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                                <ArrowUp className="w-4 h-4" />
                                Imported Data
                            </div>
                        </div>
                    </div>

                    {/* Data Flow Summary */}
                    <div className="mt-6 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <div className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3">Complete Data Flow:</div>
                        <div className="space-y-2 text-xs text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                                <span className="text-rose-500">1</span>
                                <span>User signs in via GitHub OAuth (Layer 1 → Layer 3a)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-500">2</span>
                                <span>Next.js App validates session with Supabase Auth (Layer 2 → Layer 3a)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-purple-500">3</span>
                                <span>User requests data, RLS policies check consent (Layer 2 → Layer 3b)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-500">4</span>
                                <span>Database returns only consented data via RPCs (Layer 3b → Layer 2)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500">5</span>
                                <span>For fresh import: App calls GGSIPU Systems, stores in DB (Layer 2 → Layer 4 → Layer 3b)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-rose-500">6</span>
                                <span>Dashboard displays data to user browser (All Layers → Layer 1)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-rose-500" />
                        How It Works Together
                    </h3>
                    <ol className="space-y-2 text-[var(--text-muted)] text-sm list-decimal list-inside">
                        <li>User signs in with GitHub OAuth and creates a profile.</li>
                        <li>With explicit authorization, results are fetched on-demand (one-time only) from official IPU systems.</li>
                        <li>Data is stored in Supabase with strict Row-Level Security and consent tracking.</li>
                        <li>UI renders analytics, peers, and rankboard based on opt-in consents and cohort rules.</li>
                        <li>Every consent change is logged immutably for transparency and compliance.</li>
                    </ol>
                </div>
            </section>

            {/* Disclaimers & Legal Section */}
            <section className="bg-[var(--secondary)] border-y border-[var(--card-border)] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        Important Disclaimers & Legal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-rose-500" />
                                No Credential Storage
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm">Your IPU enrollment credentials are <span className="font-semibold text-rose-400">NEVER</span> stored on our servers. They are transmitted directly to official IPU servers for authentication. We cannot access them after the initial request.</p>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-500" />
                                Not Official
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm">This platform is <span className="font-semibold">NOT</span> officially affiliated with Guru Gobind Singh Indraprastha University (GGSIPU). We are an independent student-run project and have no official endorsement from the university.</p>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-green-500" />
                                Data Accuracy
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm">All academic data displayed is fetched on-demand and one-time only from official IPU result systems, after explicit user authorization. The platform is designed to respect responsible and non-abusive use of university infrastructure. We do not modify, verify, or guarantee accuracy. For official results, always refer to the official GGSIPU portal.</p>
                        </div>

                        <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-500" />
                                Limited Liability
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm">We provide this platform "as-is" without warranties. We are not liable for data loss, service interruption, or any damages resulting from platform use. Use at your own risk.</p>
                        </div>
                    </div>

                    <div className="mt-6 p-6 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <p className="text-[var(--text-muted)] text-sm">
                            By using this platform, you acknowledge that you have read and understood these disclaimers, and you assume full responsibility for any outcomes related to your use of PeerList.
                        </p>
                    </div>
                </div>
            </section>

            {/* Privacy & Data Control Section */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
                    <Eye className="w-8 h-8 text-rose-500" />
                    Your Privacy & Data Control
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <h3 className="font-bold text-[var(--text-primary)] mb-3">What Data We Collect</h3>
                        <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Academic records (grades, SGPA, CGPA) from official IPU portal</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Your name, email, enrollment number, batch, branch, college</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Consent choices for analytics, rankings, and peer sharing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Audit logs of all consent changes (for compliance)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-1">•</span>
                                <span>Your GitHub profile (for authentication only)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <h3 className="font-bold text-[var(--text-primary)] mb-3">What We Don't Do</h3>
                        <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Never store your IPU credentials</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Never sell or share data with third parties</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Never modify your academic records</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Never use data for targeted advertising</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Never share enrollment numbers with peers</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-rose-500" />
                        Your Rights & Controls
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[var(--text-muted)] text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Export all your data anytime</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Delete account and data permanently</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Control visibility in rankings</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Revoke consent anytime</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Audit log maintained for transparency</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500">→</span>
                            <span>Choose visibility mode (Anonymous/Pseudonymous/Visible)</span>
                        </li>
                    </ul>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Privacy Policy & Terms Link */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="p-6 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] text-center">
                    <p className="text-[var(--text-muted)] mb-4">
                        For detailed information about how we collect, use, and protect your data, please review our full policies:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Privacy Policy</a>
                        <span className="text-[var(--card-border)]">•</span>
                        <a href="#" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Terms of Service</a>
                        <span className="text-[var(--card-border)]">•</span>
                        <a href="#" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Data Protection</a>
                        <span className="text-[var(--card-border)]">•</span>
                        <a href="https://github.com/bimlesh1/peerlist" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Source Code</a>
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

            {/* Footer */}
            <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)] py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <GraduationCap className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">PeerList</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mb-2">
                        Made with <Heart className="w-4 h-4 inline text-rose-500" /> by GGSIPU students for GGSIPU students
                    </p>
                    <p className="text-[var(--text-muted)] text-xs mb-3">
                        Not affiliated with Guru Gobind Singh Indraprastha University • Open Source Initiative
                    </p>
                    <p className="text-[var(--text-muted)] text-xs">
                        © 2026 PeerList. All rights reserved. | 
                        <a href="https://github.com/bimlesh1/peerlist" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 ml-1">GitHub</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
