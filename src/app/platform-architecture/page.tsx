import Link from 'next/link';
import { Code, ArrowDown, ArrowUp, ArrowLeftRight, Globe, Settings, Lock, Database, GraduationCap } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function PlatformArchitecturePage() {
    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-3 text-rose-500">
                    <Code className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase">Platform Architecture</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">How Data Flows Through ListPeers</h1>
                <p className="text-(--text-muted) mb-2">Last updated: 31 January 2026</p>
                <p className="text-(--text-muted) mb-8">
                    This diagram shows the system hierarchy and the exact data flow from the user interface to the data layer and
                    external systems. All data access is consent-gated and scoped by privacy rules.
                </p>

                <div className="p-6 rounded-lg border border-(--card-border) bg-(--card-bg)">
                    <div className="mb-5 flex flex-wrap gap-3 text-xs">
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

                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-lg border border-(--card-border) bg-(--card-bg) w-full max-w-xs text-center">
                            <div className="text-xs uppercase text-(--text-muted)">Layer 1: Presentation</div>
                            <div className="font-semibold text-(--text-primary) mt-2 flex items-center justify-center gap-2">
                                <Globe className="w-5 h-5 text-rose-500" />
                                User Browser
                            </div>
                            <div className="text-xs text-(--text-muted) mt-1">Landing • Dashboard • Peers • Rankboard • Settings</div>
                        </div>
                    </div>

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

                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-lg border border-(--card-border) bg-(--card-bg) w-full max-w-xs text-center">
                            <div className="text-xs uppercase text-(--text-muted)">Layer 2: Application</div>
                            <div className="font-semibold text-(--text-primary) mt-2 flex items-center justify-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500" />
                                Next.js App
                            </div>
                            <div className="text-xs text-(--text-muted) mt-2 grid grid-cols-3 gap-2">
                                <div className="px-2 py-1 rounded bg-secondary border border-(--card-border)">UI Pages</div>
                                <div className="px-2 py-1 rounded bg-secondary border border-(--card-border)">API Routes</div>
                                <div className="px-2 py-1 rounded bg-secondary border border-(--card-border)">Auth</div>
                            </div>
                        </div>
                    </div>

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg border border-(--card-border) bg-(--card-bg) text-center">
                            <div className="text-xs uppercase text-(--text-muted)">Layer 3a: Authentication</div>
                            <div className="font-semibold text-(--text-primary) mt-2 flex items-center justify-center gap-2">
                                <Lock className="w-5 h-5 text-purple-500" />
                                Supabase Auth
                            </div>
                            <div className="text-xs text-(--text-muted) mt-2">GitHub OAuth • Sessions</div>
                        </div>
                        <div className="p-4 rounded-lg border border-(--card-border) bg-(--card-bg) text-center">
                            <div className="text-xs uppercase text-(--text-muted)">Layer 3b: Data</div>
                            <div className="font-semibold text-(--text-primary) mt-2 flex items-center justify-center gap-2">
                                <Database className="w-5 h-5 text-amber-500" />
                                PostgreSQL DB
                            </div>
                            <div className="text-xs text-(--text-muted) mt-2">RLS • Triggers • RPCs</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-4">
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

                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-green-500">
                                <ArrowDown className="w-4 h-4" />
                                On-demand & One-time (Authorized)
                            </div>
                            <div className="h-5 w-0.5 bg-green-500/40"></div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-lg border border-(--card-border) bg-(--card-bg) w-full max-w-xs text-center">
                            <div className="text-xs uppercase text-(--text-muted)">Layer 4: External API</div>
                            <div className="font-semibold text-(--text-primary) mt-2 flex items-center justify-center gap-2">
                                <GraduationCap className="w-5 h-5 text-green-500" />
                                GGSIPU Result Systems
                            </div>
                            <div className="text-xs text-(--text-muted) mt-1">Official results source (authorized)</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-5 w-0.5 bg-green-500/40"></div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                                <ArrowUp className="w-4 h-4" />
                                Imported Data
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold mb-2">Key Principles</h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• Data access is consent-based and scoped.</li>
                            <li>• Imports are initiated only by the user.</li>
                            <li>• Privacy rules are enforced at the database layer.</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold mb-2">Security Boundaries</h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• UI never directly accesses the database.</li>
                            <li>• API routes validate and proxy requests.</li>
                            <li>• External systems are contacted only with explicit authorization.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                    <Link href="/privacy-policy" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Privacy Policy</Link>
                    <span className="text-(--card-border)">•</span>
                    <Link href="/terms-of-service" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Terms of Service</Link>
                    <span className="text-(--card-border)">•</span>
                    <Link href="/data-protection" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Data Protection</Link>
                </div>
            </section>
        </main>
            <PublicFooter />
        </>
    );
}
