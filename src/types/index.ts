// Supabase Client Types and Database Types

export interface Student {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  enrollment_no: string;
  batch: string | null;
  branch: string | null;
  college: string | null;
  consent_analytics: boolean;
  consent_rankboard: boolean;
  display_mode: 'anonymous' | 'pseudonymous' | 'visible';
  marks_visibility: boolean;
  marks_visibility_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicRecord {
  id: string;
  student_id: string;
  semester: number;
  submitted_at: string;
}

export interface Subject {
  id: string;
  record_id: string;
  code: string;
  name: string;
  internal_marks: number;
  external_marks: number;
  max_internal: number;
  max_external: number;
  total_marks: number;
  credits: number;
  grade: string | null;
  grade_point: number | null;
}

export interface ConsentLog {
  id: string;
  student_id: string;
  consent_type: 'analytics' | 'rankboard' | 'peers' | 'identity';
  action: 'granted' | 'revoked';
  logged_at: string;
}

// Rankboard safe view type (exposed fields only)
export interface RankboardEntry {
  student_id: string;
  display_name: string | null;
  batch: string | null;
  branch: string | null;
  college: string | null;
  cgpa: number;
}

// Form types for data submission
export interface SubjectInput {
  code: string;
  name: string;
  internal_marks: number;
  external_marks: number;
  credits: number;
}

export interface SemesterSubmission {
  semester: number;
  subjects: SubjectInput[];
}

// Analytics types
export interface SemesterStats {
  semester: number;
  sgpa: number;
  totalCredits: number;
  subjectCount: number;
  subjects: Subject[];
}

export interface OverallStats {
  cgpa: number;
  totalCredits: number;
  totalSubjects: number;
  totalSemesters: number;
  gradeDistribution: GradeCount[];
}

export interface GradeCount {
  grade: string;
  count: number;
  color: string;
}

// Consent flags type
export interface ConsentFlags {
  analytics: boolean;
  rankboard: boolean;
  marksVisibility: boolean;
}
