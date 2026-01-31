import Link from 'next/link';
import { FileText, AlertTriangle, Shield } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export default function TermsOfServicePage() {
    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-3 text-rose-500">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase">Terms of Service</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Terms for Using ListPeers</h1>
                <p className="text-(--text-muted) mb-2">Last updated: 31 January 2026</p>
                <p className="text-(--text-muted) mb-8">
                    ListPeers is an independent, student-run platform. By accessing or using the platform, you agree to these terms.
                </p>

                <div className="space-y-8">
                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Eligibility</h2>
                        <p className="text-(--text-muted) text-sm">
                            You must be a GGSIPU student or authorized user with valid access to your academic records. You are
                            responsible for ensuring your use complies with applicable policies and laws.
                        </p>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" />
                            Acceptable Use
                        </h2>
                        <ul className="text-(--text-muted) text-sm space-y-2">
                            <li>• Do not misuse or overload university systems.</li>
                            <li>• Do not attempt to access data that is not yours.</li>
                            <li>• Do not bypass consent or privacy controls.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            Disclaimer of Warranty
                        </h2>
                        <p className="text-(--text-muted) text-sm">
                            ListPeers is provided “as-is” without warranties. We do not guarantee data accuracy, availability, or
                            uninterrupted service. For official results, always rely on GGSIPU’s official portals.
                        </p>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Limitation of Liability</h2>
                        <p className="text-(--text-muted) text-sm">
                            We are not liable for any damages or losses resulting from use of the platform, including data loss,
                            service interruption, or reliance on displayed information.
                        </p>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Termination</h2>
                        <p className="text-(--text-muted) text-sm">
                            You may delete your account at any time. We may suspend access if misuse or violations are detected.
                        </p>
                    </section>

                    <section className="p-6 rounded-lg border border-(--card-border) bg-secondary">
                        <h2 className="font-semibold text-lg mb-2">Changes to Terms</h2>
                        <p className="text-(--text-muted) text-sm">
                            We may update these terms as the platform evolves. Continued use means you accept the updated terms.
                        </p>
                    </section>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                    <Link href="/privacy-policy" className="text-rose-500 hover:text-rose-600 font-medium text-sm">Privacy Policy</Link>
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
