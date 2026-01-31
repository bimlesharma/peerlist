'use client';

import Link from 'next/link';
import { GraduationCap, Github, Heart } from 'lucide-react';

export function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer 
            className="border-t border-(--card-border) bg-(--card-bg) relative overflow-hidden"
        >
            <div className="px-[20%] py-16 sm:py-16 text-center relative z-10">
                {/* Brand */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
                        <div className="w-36 h-36 flex items-center justify-center" style={{color: 'var(--primary)'}}>
                            <GraduationCap className="w-full h-full" />
                        </div>
                        <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-pink-600 leading-none">
                            PeerList
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl text-(--text-primary) font-semibold mb-3">
                        Privacy-First Academic Analytics
                    </p>
                    <p className="text-(--text-muted) max-w-md mx-auto mb-8">
                        Take control of your academic journey with complete transparency and consent-driven sharing
                    </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-linear-to-r from-transparent via-(--card-border) to-transparent mb-8"></div>

                {/* Bottom Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-(--text-muted) text-sm">
                    <p>© {currentYear} PeerList • Student-Run • Open Source</p>
                    <span className="hidden sm:inline">•</span>
                    <a href="https://github.com/bimlesh1/peerlist" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                        <Github className="w-4 h-4" />
                        GitHub
                    </a>
                    <span className="hidden sm:inline">•</span>
                    <p className="flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-rose-500" /> by students
                    </p>
                </div>
            </div>
        </footer>
    );
}
