'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { DisclaimerFooter } from '@/components/DisclaimerFooter';
import { hashPassword } from '@/lib/crypto';
import { marksToGrade, marksToGradePoint } from '@/lib/grading';
import { getSubjectCredits } from '@/data/subjectCredits';
import type { IPUResult, CaptchaResponse, LoginResponse, IPUResultsResponse } from '@/types/ipu';
import {
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ShieldCheck,
    ArrowRight,
    Download,
} from 'lucide-react';

type Step = 'ipu-login' | 'fetching' | 'review' | 'consent';

interface SemesterData {
    semester: number;
    subjects: IPUResult[];
}

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    // Step state
    const [step, setStep] = useState<Step>('ipu-login');

    // IPU login state
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [sessionId, setSessionId] = useState('');

    // Fetched data state
    const [studentName, setStudentName] = useState('');
    const [studentInstitute, setStudentInstitute] = useState('');
    const [studentProgram, setStudentProgram] = useState('');
    const [studentBatch, setStudentBatch] = useState('');
    const [semesterResults, setSemesterResults] = useState<SemesterData[]>([]);

    // Consent state - DEFAULT ALL TO TRUE (shown as ON)
    const [consentAnalytics, setConsentAnalytics] = useState(true);
    const [consentRankboard, setConsentRankboard] = useState(true);
    const [consentMarksVisibility, setConsentMarksVisibility] = useState(true);
    const [displayMode, setDisplayMode] = useState<'anonymous' | 'pseudonymous' | 'visible'>('anonymous');
    const [acknowledgeVoluntary, setAcknowledgeVoluntary] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchProgress, setFetchProgress] = useState('');

    // Check if user already has a profile
    useEffect(() => {
        const checkExistingProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/');
                return;
            }

            // Check if profile exists by user ID (simpler query to avoid RLS issues)
            const { data: existingProfile } = await supabase
                .from('students')
                .select('id, enrollment_no')
                .eq('id', user.id)
                .maybeSingle();

            if (existingProfile) {
                console.log('Existing profile found, redirecting to dashboard');
                router.replace('/dashboard');
                return;
            }

            setCheckingProfile(false);
        };

        checkExistingProfile();
    }, [supabase, router]);

    // Fetch captcha on mount
    const fetchCaptcha = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ipu/captcha');
            const data: CaptchaResponse = await res.json();
            if (data.success && data.captchaImage && data.sessionId) {
                setCaptchaImage(data.captchaImage);
                setSessionId(data.sessionId);
                setCaptchaInput('');
            } else {
                setError(data.message || 'Failed to load captcha');
            }
        } catch {
            setError('Failed to connect to IPU server. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!checkingProfile && step === 'ipu-login') {
            fetchCaptcha();
        }
    }, [checkingProfile, step, fetchCaptcha]);

    // Handle IPU login
    const handleIPULogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollmentNo || !password || !captchaInput) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const hashedPassword = await hashPassword(password, captchaInput);

            const res = await fetch('/api/ipu/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: enrollmentNo,
                    hashedPassword,
                    captcha: captchaInput,
                    sessionId,
                }),
            });

            const data: LoginResponse = await res.json();

            if (data.success && data.sessionId) {
                setSessionId(data.sessionId);
                setStep('fetching');
                await fetchAllResults(data.sessionId);
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
                fetchCaptcha();
            }
        } catch {
            setError('Login failed. Please try again.');
            fetchCaptcha();
        } finally {
            setLoading(false);
        }
    };

    // Fetch all semester results
    const fetchAllResults = async (session: string) => {
        setLoading(true);
        setError(null);
        setFetchProgress('Fetching all semester results...');

        try {
            // Fetch all results (semester=100 means all)
            const res = await fetch(`/api/ipu/results?sessionId=${session}&semester=100`);
            const data: IPUResultsResponse = await res.json();

            if (!data.success || !data.results || data.results.length === 0) {
                setError('No results found for this enrollment number. Please ensure you have declared results.');
                setStep('ipu-login');
                fetchCaptcha();
                return;
            }

            // Extract student info from first result
            const firstResult = data.results[0];
            setStudentName(firstResult.stname || '');
            setStudentInstitute(firstResult.instname || firstResult.iname || '');
            setStudentProgram(firstResult.progname || firstResult.prgname || '');
            setStudentBatch(firstResult.batch || firstResult.yoa || '');

            // Group results by semester
            const semesterMap = new Map<number, IPUResult[]>();
            for (const result of data.results) {
                const semNum = typeof result.euno === 'string' ? parseInt(result.euno) : (result.euno || 1);
                if (!semesterMap.has(semNum)) {
                    semesterMap.set(semNum, []);
                }
                semesterMap.get(semNum)!.push(result);
            }

            // Convert to array and sort by semester
            const semesters: SemesterData[] = Array.from(semesterMap.entries())
                .map(([semester, subjects]) => ({ semester, subjects }))
                .sort((a, b) => a.semester - b.semester);

            setSemesterResults(semesters);
            setStep('review');
        } catch {
            setError('Failed to fetch results. Please try again.');
            setStep('ipu-login');
            fetchCaptcha();
        } finally {
            setLoading(false);
            setFetchProgress('');
        }
    };

    // Handle final submission
    const handleSubmit = async () => {
        if (!acknowledgeVoluntary) {
            setError('Please acknowledge that you are submitting data voluntarily.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/');
                return;
            }

            // Check if profile already exists for this user or enrollment number
            const { data: existingByUser } = await supabase
                .from('students')
                .select('id, enrollment_no')
                .eq('id', user.id)
                .maybeSingle();

            if (existingByUser) {
                console.log('Profile already exists for this user, redirecting to dashboard');
                router.refresh();
                router.replace('/dashboard');
                return;
            }

            const { data: existingByEnrollment } = await supabase
                .from('students')
                .select('id, email')
                .eq('enrollment_no', enrollmentNo.trim().toUpperCase())
                .maybeSingle();

            if (existingByEnrollment) {
                setError('This enrollment number is already registered with another account. If this is your enrollment number, please contact support.');
                setLoading(false);
                return;
            }

            // Validate college is provided
            if (!studentInstitute || studentInstitute.trim() === '') {
                setError('College/Institute information is required. Please ensure your IPU profile has complete information.');
                setLoading(false);
                return;
            }

            // Create student profile with explicit consent values
            const { error: insertError } = await supabase
                .from('students')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: studentName || user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url,
                    enrollment_no: enrollmentNo.trim().toUpperCase(),
                    batch: studentBatch || null,
                    branch: studentProgram || null,
                    college: studentInstitute.trim(),
                    consent_analytics: consentAnalytics,
                    consent_rankboard: consentRankboard,
                    display_mode: displayMode,
                    marks_visibility: consentMarksVisibility,
                    marks_visibility_at: consentMarksVisibility ? new Date().toISOString() : null,
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                // Check if the error is due to duplicate key
                if (insertError.code === '23505') {
                    // Duplicate key violation - profile might have been created
                    console.log('Duplicate key error, checking if profile exists now');
                    const { data: profile } = await supabase
                        .from('students')
                        .select('id')
                        .eq('id', user.id)
                        .maybeSingle();
                    
                    if (profile) {
                        // Profile exists now, redirect to dashboard
                        router.refresh();
                        router.replace('/dashboard');
                        return;
                    }
                }
                setError('Failed to create profile. Please try again.');
                setLoading(false);
                return;
            }

            // Consent logging is handled automatically by the database trigger (trg_consent_audit)
            // when the student record is updated above. No manual inserts needed.

            // Insert all academic records and subjects
            for (const semData of semesterResults) {
                // Create academic record
                const { data: record, error: recordError } = await supabase
                    .from('academic_records')
                    .insert({
                        student_id: user.id,
                        semester: semData.semester,
                    })
                    .select()
                    .single();

                if (recordError) {
                    console.error('Record error:', recordError);
                    continue; // Skip this semester but continue with others
                }

                // Insert subjects for this semester
                const subjectsToInsert = semData.subjects.map(result => {
                    const internalMarks = parseInt(result.minorprint) || 0;
                    const externalMarks = parseInt(result.majorprint) || 0;
                    const totalMarks = parseInt(result.moderatedprint) || (internalMarks + externalMarks);

                    // Priority 1: Use credits from subjectCredits.ts data file
                    let credits = 0;
                    if (result.papercode) {
                        const dataCredits = getSubjectCredits(result.papercode.trim().toUpperCase());
                        if (dataCredits !== undefined) {
                            credits = dataCredits;
                        }
                    }

                    // Priority 2: Try to use actual credits from API
                    if (credits === 0 && result.credits !== undefined && result.credits !== null) {
                        const apiCredits = typeof result.credits === 'string'
                            ? parseInt(result.credits)
                            : result.credits;
                        if (!isNaN(apiCredits) && apiCredits > 0) {
                            credits = apiCredits;
                        }
                    }

                    // Priority 3: Estimate based on marks structure
                    if (credits === 0) {
                        // Estimate credits:
                        // - If has internal marks > 20, likely theory (4 credits)
                        // - If internal marks <= 20 or no internal, likely lab (2 credits)
                        credits = 4; // Default for theory
                        if (internalMarks === 0 || (internalMarks <= 20 && totalMarks <= 50)) {
                            credits = 2; // Lab/Practical
                        }
                    }

                    // Clamp internal/external to database constraints (max_internal: 40, max_external: 60)
                    const clampedInternal = Math.min(Math.max(internalMarks, 0), 40);
                    const clampedExternal = Math.min(Math.max(externalMarks, 0), 60);
                    const clampedCredits = Math.min(Math.max(credits, 1), 10);

                    return {
                        record_id: record.id,
                        code: result.papercode.trim().toUpperCase(),
                        name: result.papername.trim(),
                        internal_marks: clampedInternal,
                        external_marks: clampedExternal,
                        max_internal: 40,
                        max_external: 60,
                        credits: clampedCredits,
                        grade: marksToGrade(totalMarks),
                        grade_point: marksToGradePoint(totalMarks),
                    };
                });

                const { error: subjectsError } = await supabase.from('subjects').insert(subjectsToInsert);
                if (subjectsError) {
                    console.error('Subjects insert error:', subjectsError);
                }
            }

            // Redirect to dashboard
            router.refresh();
            router.replace('/dashboard');
        } catch (err) {
            console.error('Onboarding error:', err);
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    // Calculate totals for review
    const totalSubjects = semesterResults.reduce((sum, s) => sum + s.subjects.length, 0);

    // Show loading while checking for existing profile
    if (checkingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 animate-fade-in-up">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <GraduationCap className="w-8 h-8 text-[var(--primary)]" />
                            <h1 className="text-2xl font-bold text-gradient">PeerList</h1>
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            {step === 'ipu-login' && 'Verify Your Identity'}
                            {step === 'fetching' && 'Fetching Your Results'}
                            {step === 'review' && 'Review Your Data'}
                            {step === 'consent' && 'Privacy Settings'}
                        </h2>
                        <p className="text-[var(--text-secondary)] mt-2">
                            {step === 'ipu-login' && 'Login with your official IPU portal credentials'}
                            {step === 'fetching' && 'Please wait while we fetch your academic records'}
                            {step === 'review' && 'Confirm your academic data before proceeding'}
                            {step === 'consent' && 'Configure your privacy preferences'}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[var(--error)] bg-opacity-10 text-[var(--error)] animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: IPU Login */}
                    {step === 'ipu-login' && (
                        <form onSubmit={handleIPULogin} className="card p-6 space-y-4 animate-fade-in-up stagger-1">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-rose-500" />
                                <p className="text-sm text-[var(--text-primary)]">Your credentials are sent directly to the official IPU server and are never stored.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                    Enrollment Number
                                </label>
                                <input
                                    type="text"
                                    value={enrollmentNo}
                                    onChange={(e) => setEnrollmentNo(e.target.value)}
                                    placeholder="e.g., 12345678901"
                                    className="input w-full"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                    IPU Portal Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your IPU portal password"
                                    className="input w-full"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                                    Captcha
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    {captchaImage ? (
                                        <img
                                            src={captchaImage}
                                            alt="Captcha"
                                            className="h-10 rounded border border-[var(--card-border)]"
                                        />
                                    ) : (
                                        <div className="h-10 w-24 bg-[var(--secondary)] rounded border border-[var(--card-border)] flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-secondary)]" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={fetchCaptcha}
                                        disabled={loading}
                                        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors rounded-lg hover:bg-[var(--hover-bg)]"
                                        title="Refresh captcha"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    placeholder="Enter captcha"
                                    className="input w-full"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !captchaImage}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Verify & Fetch Results
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Fetching */}
                    {step === 'fetching' && (
                        <div className="card p-8 animate-fade-in-up">
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
                                <p className="text-[var(--text-primary)] text-center font-medium">{fetchProgress}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 'review' && (
                        <div className="card p-6 space-y-4 animate-fade-in-up stagger-1">
                            <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{studentName}</h3>
                                <div className="space-y-1.5 text-sm">
                                    <p className="text-[var(--text-primary)]">
                                        <span className="text-[var(--text-secondary)]">Enrollment:</span> {enrollmentNo}
                                    </p>
                                    {studentInstitute && (
                                        <p className="text-[var(--text-primary)]">
                                            <span className="text-[var(--text-secondary)]">Institute:</span> {studentInstitute}
                                        </p>
                                    )}
                                    {studentProgram && (
                                        <p className="text-[var(--text-primary)]">
                                            <span className="text-[var(--text-secondary)]">Program:</span> {studentProgram}
                                        </p>
                                    )}
                                    {studentBatch && (
                                        <p className="text-[var(--text-primary)]">
                                            <span className="text-[var(--text-secondary)]">Batch:</span> {studentBatch}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                                    Academic Records Found
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] text-center">
                                        <p className="text-2xl font-bold text-rose-500">{semesterResults.length}</p>
                                        <p className="text-xs font-medium text-[var(--text-secondary)]">Semesters</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)] text-center">
                                        <p className="text-2xl font-bold text-rose-500">{totalSubjects}</p>
                                        <p className="text-xs font-medium text-[var(--text-secondary)]">Subjects</p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {semesterResults.map((sem) => (
                                    <div key={sem.semester} className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-[var(--text-primary)]">
                                                Semester {sem.semester}
                                            </span>
                                            <span className="text-xs font-medium text-[var(--text-secondary)]">
                                                {sem.subjects.length} subjects
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep('consent')}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 4: Consent */}
                    {step === 'consent' && (
                        <div className="card p-6 space-y-6 animate-fade-in-up stagger-1">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                    Privacy & Sharing Settings
                                </h3>

                                {/* Analytics Toggle */}
                                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            Personal Analytics
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            View your SGPA/CGPA trends and grade distributions
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={consentAnalytics}
                                        onClick={() => setConsentAnalytics(!consentAnalytics)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-background ${
                                            consentAnalytics ? 'bg-rose-500' : 'bg-(--card-border)'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                consentAnalytics ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Rankboard Toggle */}
                                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            Rankboard (College Leaderboard)
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            Compare CGPA with peers from your college
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={consentRankboard}
                                        onClick={() => setConsentRankboard(!consentRankboard)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-background ${
                                            consentRankboard ? 'bg-rose-500' : 'bg-(--card-border)'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                consentRankboard ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Peers/Marks Visibility Toggle */}
                                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            Share Marks with Peers
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            View and compare detailed marks with classmates from your college
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={consentMarksVisibility}
                                        onClick={() => setConsentMarksVisibility(!consentMarksVisibility)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-background ${
                                            consentMarksVisibility ? 'bg-rose-500' : 'bg-(--card-border)'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                consentMarksVisibility ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Display Mode Selector */}
                                <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                    <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                                        Identity Display
                                    </p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="displayMode"
                                                value="anonymous"
                                                checked={displayMode === 'anonymous'}
                                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                                            />
                                            <div>
                                                <span className="text-sm text-[var(--text-primary)]">Anonymous</span>
                                                <p className="text-xs text-[var(--text-secondary)]">Your name is hidden</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="displayMode"
                                                value="pseudonymous"
                                                checked={displayMode === 'pseudonymous'}
                                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                                            />
                                            <div>
                                                <span className="text-sm text-[var(--text-primary)]">Pseudonymous</span>
                                                <p className="text-xs text-[var(--text-secondary)]">Show as "Student-XXXXXX"</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="displayMode"
                                                value="visible"
                                                checked={displayMode === 'visible'}
                                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                                            />
                                            <div>
                                                <span className="text-sm text-[var(--text-primary)]">Visible</span>
                                                <p className="text-xs text-[var(--text-secondary)]">Show your real name</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--card-border)]">
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={acknowledgeVoluntary}
                                        onClick={() => setAcknowledgeVoluntary(!acknowledgeVoluntary)}
                                        className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                                            acknowledgeVoluntary
                                                ? 'bg-rose-500 border-rose-500'
                                                : 'bg-transparent border-[var(--text-secondary)] hover:border-rose-500'
                                        }`}
                                    >
                                        {acknowledgeVoluntary && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                        )}
                                    </button>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            I acknowledge voluntary submission <span className="text-rose-500">*</span>
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            I understand that I am submitting my academic data voluntarily and
                                            this platform is not affiliated with any university.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('review')}
                                    className="btn-secondary flex-1"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !acknowledgeVoluntary}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Complete Setup
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <DisclaimerFooter />
        </div>
    );
}
