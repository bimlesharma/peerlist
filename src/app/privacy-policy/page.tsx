import Link from 'next/link';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function PrivacyPolicyPage() {
    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-3 text-rose-500">
                    <Shield className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase">Privacy Policy</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Your Privacy, Your Control</h1>
                <p className="text-(--text-muted) mb-2">Last updated: 31 January 2026</p>
                <p className="text-(--text-muted) mb-8">
                    This policy explains how PeerList collects, uses, and protects your data. We are a student-run, independent
                    project and are not affiliated with GGSIPU. All academic data displayed is fetched on-demand and one-time only
                    from official GGSIPU result systems, after explicit user authorization.
                </p>

                <div className="space-y-8">
                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-rose-500" />
                            Data We Collect
                        </h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• Account identity from GitHub OAuth (name, email, avatar as provided).</li>
                            <li>• Academic results you authorize us to import from GGSIPU systems.</li>
                            <li>• Consent preferences (analytics, rankboard, peers, identity visibility).</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-rose-500" />
                            What We Do Not Collect
                        </h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• Your IPU credentials are never stored on our servers.</li>
                            <li>• We do not access or modify official university records.</li>
                            <li>• We do not sell personal data or use it for advertising.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-rose-500" />
                            How Your Data Is Used
                        </h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• To show your own dashboard and analytics.</li>
                            <li>• To enable peer comparisons and rankboards, only when you consent.</li>
                            <li>• To keep an immutable audit log of consent changes.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Retention & Deletion</h2>
                        <p className="text-(--text-muted) text-sm">
                            You can delete your account at any time. This permanently removes your data from our database. Consent
                            logs are retained as an immutable record of your choices.
                        </p>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Security Measures</h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• Encrypted connections (HTTPS/TLS).</li>
                            <li>• Row-Level Security (RLS) to isolate user data.</li>
                            <li>• Consent-gated RPCs for scoped access.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                    <Link href="/terms-of-service" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Terms of Service</Link>
                    <span className="text-(--card-border)">•</span>
                    <Link href="/data-protection" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Data Protection</Link>
                    <span className="text-(--card-border)">•</span>
                    <Link href="/platform-architecture" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Platform Architecture</Link>
                </div>
            </section>
        </main>
            <PublicFooter />
        </>
    );
}
