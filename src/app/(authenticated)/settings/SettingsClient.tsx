'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Student, AcademicRecord, Subject, ConsentLog } from '@/types';
import {
    Settings,
    Shield,
    Eye,
    Download,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    History,
    User,
    Save,
    ChevronRight
} from 'lucide-react';

interface RecordWithSubjects extends AcademicRecord {
    subjects: Subject[];
}

interface SettingsClientProps {
    student: Student;
    records: RecordWithSubjects[];
    consentLogs: ConsentLog[];
}

export function SettingsClient({ student, records, consentLogs }: SettingsClientProps) {
    const router = useRouter();
    const supabase = createClient();

    const [consentAnalytics, setConsentAnalytics] = useState(student.consent_analytics);
    const [consentRankboard, setConsentRankboard] = useState(student.consent_rankboard);
    const [displayMode, setDisplayMode] = useState(student.display_mode);
    const [marksVisibility, setMarksVisibility] = useState(student.marks_visibility);

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const [showMarksConfirm, setShowMarksConfirm] = useState(false);

    const handleSaveConsent = async () => {
        setSaving(true);
        setError(null);
        setSaveSuccess(false);

        try {
            const { error: updateError } = await supabase
                .from('students')
                .update({
                    consent_analytics: consentAnalytics,
                    consent_rankboard: consentRankboard,
                    display_mode: displayMode,
                    marks_visibility: marksVisibility,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', student.id);

            if (updateError) {
                setError('Failed to save settings. Please try again.');
            } else {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                router.refresh();
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = () => {
        const exportData = {
            profile: {
                enrollment_no: student.enrollment_no,
                name: student.name,
                batch: student.batch,
                branch: student.branch,
                college: student.college,
                created_at: student.created_at,
            },
            consent: {
                analytics: student.consent_analytics,
                rankboard: student.consent_rankboard,
                display_mode: student.display_mode,
                marks_visibility: student.marks_visibility,
            },
            academic_records: records.map(r => ({
                semester: r.semester,
                submitted_at: r.submitted_at,
                subjects: r.subjects.map(s => ({
                    code: s.code,
                    name: s.name,
                    internal_marks: s.internal_marks,
                    external_marks: s.external_marks,
                    total_marks: s.total_marks,
                    credits: s.credits,
                    grade: s.grade,
                    grade_point: s.grade_point,
                })),
            })),
            consent_log: consentLogs,
            exported_at: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `peerlist-export-${student.enrollment_no}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAllData = async () => {
        if (deleteConfirmText !== student.enrollment_no) {
            setError('Please type your enrollment number to confirm deletion.');
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            // Step 1: Log deletion event for GDPR compliance (before deleting data)
            let deletionEventId: string | null = null;
            
            const { error: logError, data: deletionData } = await supabase.rpc('log_account_deletion', {
                p_user_id: student.id,
                p_email: student.email,
                p_deletion_reason: 'User-initiated account deletion'
            });

            if (logError) {
                console.error('Failed to log deletion event:', logError);
                setError('Deletion event logging failed, but proceeding with account deletion.');
            } else {
                deletionEventId = deletionData;
                console.log('Deletion event logged with ID:', deletionEventId);
            }

            // Step 2: Delete all user data
            const { error: deleteError } = await supabase
                .from('students')
                .delete()
                .eq('id', student.id);

            if (deleteError) {
                setError('Failed to delete data. Please try again.');
                setDeleting(false);
                return;
            }

            // Step 3: Mark deletion as verified in compliance logs (if we have a deletion event ID)
            if (deletionEventId) {
                try {
                    const { error: verifyError } = await supabase.rpc('verify_deletion_compliance', {
                        p_deletion_id: deletionEventId,
                        p_verified_by: 'system_automated'
                    });
                    
                    if (verifyError) {
                        console.error('Failed to verify deletion compliance:', verifyError);
                    } else {
                        console.log('Deletion compliance verified');
                    }
                } catch (err) {
                    console.error('Error verifying deletion:', err);
                }
            }

            // Step 4: Sign out and redirect
            await supabase.auth.signOut();
            router.push('/');
        } catch (err) {
            console.error('Delete error:', err);
            setError('An unexpected error occurred. Please contact support.');
            setDeleting(false);
        }
    };

    const handleMarksVisibilityToggle = (checked: boolean) => {
        if (checked) {
            setShowMarksConfirm(true);
        } else {
            setMarksVisibility(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
                <p className="text-[var(--text-secondary)] mt-2">
                    Manage your privacy settings and data
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
            )}

            {/* Success Alert */}
            {saveSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-500 font-medium">Settings saved successfully!</p>
                </div>
            )}

            {/* Profile Info */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 mb-6 animate-fade-in-up stagger-1">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                        <User className="w-5 h-5 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Profile</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Enrollment</span>
                        <p className="text-[var(--text-primary)] font-mono font-semibold mt-1">{student.enrollment_no}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Batch</span>
                        <p className="text-[var(--text-primary)] font-semibold mt-1">{student.batch || 'Not set'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Branch</span>
                        <p className="text-[var(--text-primary)] font-semibold mt-1">{student.branch || 'Not set'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">College</span>
                        <p className="text-[var(--text-primary)] font-semibold mt-1 text-sm">{student.college || 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 mb-6 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                        <Shield className="w-5 h-5 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Privacy Settings</h2>
                </div>

                <div className="space-y-4">
                    {/* Personal Analytics Toggle */}
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-[var(--secondary)] border border-[var(--card-border)] cursor-pointer hover:border-rose-500/30 transition-colors group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={consentAnalytics}
                                onChange={(e) => setConsentAnalytics(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 rounded-full bg-[var(--card-border)] peer-checked:bg-rose-500 transition-colors"></div>
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md peer-checked:translate-x-4 transition-transform"></div>
                        </div>
                        <div className="flex-1">
                            <span className="text-[var(--text-primary)] font-semibold block">
                                Personal Analytics
                            </span>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                View your SGPA/CGPA trends and grade distributions
                            </p>
                        </div>
                    </label>

                    {/* Rankboard Participation Toggle */}
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-[var(--secondary)] border border-[var(--card-border)] cursor-pointer hover:border-rose-500/30 transition-colors group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={consentRankboard}
                                onChange={(e) => setConsentRankboard(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 rounded-full bg-[var(--card-border)] peer-checked:bg-rose-500 transition-colors"></div>
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md peer-checked:translate-x-4 transition-transform"></div>
                        </div>
                        <div className="flex-1">
                            <span className="text-[var(--text-primary)] font-semibold block">
                                Participate in Rankboard
                            </span>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Share your CGPA and compare with peers
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Display Settings */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 mb-6 animate-fade-in-up stagger-3">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                        <Eye className="w-5 h-5 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Display Mode</h2>
                </div>

                <div className="space-y-3">
                    {[
                        { value: 'anonymous', label: 'Anonymous', desc: 'Show only as "Anonymous"' },
                        { value: 'pseudonymous', label: 'Pseudonymous', desc: 'Show as "Student xxxx"' },
                        { value: 'visible', label: 'Visible', desc: 'Show your name on rankboard' },
                    ].map((mode) => (
                        <label
                            key={mode.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                displayMode === mode.value
                                    ? 'bg-rose-500/10 border-rose-500/50'
                                    : 'bg-[var(--secondary)] border-[var(--card-border)] hover:border-rose-500/30'
                            }`}
                        >
                            <div className="relative">
                                <input
                                    type="radio"
                                    name="displayMode"
                                    value={mode.value}
                                    checked={displayMode === mode.value}
                                    onChange={(e) => setDisplayMode(e.target.value as typeof displayMode)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    displayMode === mode.value
                                        ? 'border-rose-500'
                                        : 'border-[var(--card-border)]'
                                }`}>
                                    {displayMode === mode.value && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-[var(--text-primary)] font-semibold block">{mode.label}</span>
                                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{mode.desc}</p>
                            </div>
                            {displayMode === mode.value && (
                                <ChevronRight className="w-5 h-5 text-rose-500" />
                            )}
                        </label>
                    ))}
                </div>

                {/* Marks Visibility */}
                <div className="mt-6 pt-5 border-t border-[var(--card-border)]">
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 cursor-pointer hover:bg-amber-500/10 transition-colors">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={marksVisibility}
                                onChange={(e) => handleMarksVisibilityToggle(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 rounded-full bg-[var(--card-border)] peer-checked:bg-amber-500 transition-colors"></div>
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md peer-checked:translate-x-4 transition-transform"></div>
                        </div>
                        <div className="flex-1">
                            <span className="text-[var(--text-primary)] font-semibold block">
                                Share Marks with Classmates
                            </span>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Allow other opted-in users to see your detailed subject marks
                            </p>
                            {student.marks_visibility_at && (
                                <p className="text-xs text-amber-500 mt-2">
                                    Enabled on: {new Date(student.marks_visibility_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="mb-6">
                <button
                    onClick={handleSaveConsent}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20 transition-all"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>

            {/* Consent History */}
            {consentLogs.length > 0 && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 mb-6 animate-fade-in-up stagger-4">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-rose-500/10">
                            <History className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Consent History</h2>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {consentLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--secondary)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-3">
                                    <span className="text-[var(--text-primary)] font-medium capitalize">
                                        {log.consent_type.replace('_', ' ')}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${
                                        log.action === 'granted'
                                            ? 'bg-emerald-500/20 text-emerald-500'
                                            : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {log.action}
                                    </span>
                                </div>
                                <span className="text-[var(--text-secondary)] text-xs">
                                    {new Date(log.logged_at).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Management */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 animate-fade-in-up stagger-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                        <Download className="w-5 h-5 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Data Management</h2>
                </div>

                <div className="mb-6">
                    <button
                        onClick={handleExportData}
                        className="w-full sm:w-auto px-5 py-3 bg-[var(--secondary)] hover:bg-[var(--hover-bg)] border border-[var(--card-border)] hover:border-rose-500/30 text-[var(--text-primary)] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Export All Data
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/30">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h3>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-[var(--text-primary)] hover:text-red-500 font-medium flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete All My Data
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[var(--text-primary)]">
                                This will permanently delete all your data including academic records.
                                Type your enrollment number <strong className="text-red-500">{student.enrollment_no}</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type enrollment number"
                                className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-red-500 focus:outline-none transition-colors"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-4 py-2 bg-[var(--secondary)] border border-[var(--card-border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAllData}
                                    disabled={deleting || deleteConfirmText !== student.enrollment_no}
                                    className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Marks Visibility Confirmation Modal */}
            {showMarksConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-md w-full p-6 animate-scale-in shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                Confirm Marks Visibility
                            </h3>
                        </div>
                        <p className="text-[var(--text-secondary)] mb-6">
                            I understand my academic marks will be visible to other opted-in students.
                            This can be revoked at any time.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowMarksConfirm(false)}
                                className="px-4 py-2 bg-[var(--secondary)] border border-[var(--card-border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setMarksVisibility(true);
                                    setShowMarksConfirm(false);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:from-rose-500 hover:to-pink-500 transition-all"
                            >
                                I Understand, Enable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
