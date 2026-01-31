import Link from 'next/link';
import { ShieldCheck, Lock, Server, Database } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';

export default function DataProtectionPage() {
    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-3 text-rose-500">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase">Data Protection</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Security & Data Protection Practices</h1>
                <p className="text-[var(--text-muted)] mb-2">Last updated: 31 January 2026</p>
                <p className="text-[var(--text-muted)] mb-8">
                    This page outlines the technical and organizational measures used to protect student data across the platform.
                </p>

                <div className="space-y-8">
                    <section className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--secondary)]">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-rose-500" />
                            Encryption & Transport Security
                        </h2>
                        <ul className="text-[var(--text-muted)] text-sm space-y-2">
                            <li>• HTTPS/TLS for all traffic.</li>
                            <li>• Secure sessions managed by Supabase Auth.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--secondary)]">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Database className="w-5 h-5 text-rose-500" />
                            Access Control & Isolation
                        </h2>
                        <ul className="text-[var(--text-muted)] text-sm space-y-2">
                            <li>• Row-Level Security (RLS) ensures users see only their own data.</li>
                            <li>• RPCs enforce consent gates for peers and rankboards.</li>
                            <li>• Consent changes are logged immutably via database triggers.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--secondary)]">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Server className="w-5 h-5 text-rose-500" />
                            Data Minimization
                        </h2>
                        <ul className="text-[var(--text-muted)] text-sm space-y-2">
                            <li>• Academic data is fetched on-demand and one-time only.</li>
                            <li>• Credentials are never stored on our servers.</li>
                            <li>• Data is stored only as required for user-requested features.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                    <Link href="/privacy-policy" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Privacy Policy</Link>
                    <span className="text-[var(--card-border)]">•</span>
                    <Link href="/terms-of-service" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Terms of Service</Link>
                    <span className="text-[var(--card-border)]">•</span>
                    <Link href="/platform-architecture" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Platform Architecture</Link>
                </div>
            </section>
        </main>
        </>
    );
}
