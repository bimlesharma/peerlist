-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. STUDENTS (IDENTITY + CONSENT)
-- =====================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,

  enrollment_no TEXT NOT NULL,
  batch TEXT,
  branch TEXT,
  college TEXT NOT NULL,

  -- Privacy Controls
  consent_analytics BOOLEAN DEFAULT false,
  consent_rankboard BOOLEAN DEFAULT false,
  marks_visibility BOOLEAN DEFAULT false,
  marks_visibility_at TIMESTAMPTZ,
  display_mode TEXT DEFAULT 'anonymous'
    CHECK (display_mode IN ('anonymous','pseudonymous','visible')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (enrollment_no, college)
);

-- =====================================================
-- 3. ACADEMIC RECORDS
-- =====================================================
CREATE TABLE public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 10),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, semester)
);

-- =====================================================
-- 4. SUBJECTS (FLEXIBLE MARKS SCHEME)
-- =====================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.academic_records(id) ON DELETE CASCADE,

  code TEXT,
  name TEXT,

  -- Marks Data
  internal_marks INTEGER DEFAULT 0 CHECK (internal_marks >= 0),
  external_marks INTEGER DEFAULT 0 CHECK (external_marks >= 0),

  -- Scheme Configuration
  max_internal INTEGER DEFAULT 40 CHECK (max_internal > 0),
  max_external INTEGER DEFAULT 60 CHECK (max_external > 0),

  -- Computed Total
  total_marks INTEGER GENERATED ALWAYS AS (
    COALESCE(internal_marks, 0) + COALESCE(external_marks, 0)
  ) STORED,

  -- Integrity Checks
  CHECK (internal_marks <= max_internal),
  CHECK (external_marks <= max_external),

  credits INTEGER NOT NULL CHECK (credits BETWEEN 1 AND 10),
  grade TEXT,
  grade_point NUMERIC(3,1) CHECK (grade_point BETWEEN 0 AND 10)
);

-- =====================================================
-- 5. CONSENT AUDIT LOG
-- =====================================================
CREATE TABLE public.consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  consent_type TEXT CHECK (consent_type IN ('analytics','rankboard','peers','identity')),
  action TEXT CHECK (action IN ('granted','revoked')),
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. TRIGGERS (AUDIT & TIMESTAMPS)
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Audit Consent Changes
CREATE OR REPLACE FUNCTION public.log_consent_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF old.consent_analytics IS DISTINCT FROM new.consent_analytics THEN
    INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'analytics',
      CASE WHEN new.consent_analytics THEN 'granted' ELSE 'revoked' END, now());
  END IF;

  IF old.consent_rankboard IS DISTINCT FROM new.consent_rankboard THEN
    INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'rankboard',
      CASE WHEN new.consent_rankboard THEN 'granted' ELSE 'revoked' END, now());
  END IF;

  IF old.marks_visibility IS DISTINCT FROM new.marks_visibility THEN
    INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'peers',
      CASE WHEN new.marks_visibility THEN 'granted' ELSE 'revoked' END, now());

    new.marks_visibility_at :=
      CASE WHEN new.marks_visibility THEN now() ELSE NULL END;
  END IF;

  IF old.display_mode IS DISTINCT FROM new.display_mode THEN
    INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'identity', 'granted', now());
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_consent_audit
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.log_consent_changes();

-- Audit Initial Consent Choices (on INSERT during onboarding)
CREATE OR REPLACE FUNCTION public.log_initial_consents()
RETURNS TRIGGER AS $$
BEGIN
  -- Log ALL consent_analytics decisions (granted or revoked)
  INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'analytics',
    CASE WHEN new.consent_analytics THEN 'granted' ELSE 'revoked' END, now());

  -- Log ALL consent_rankboard decisions (granted or revoked)
  INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'rankboard',
    CASE WHEN new.consent_rankboard THEN 'granted' ELSE 'revoked' END, now());

  -- Log ALL marks_visibility decisions (granted or revoked)
  INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'peers',
    CASE WHEN new.marks_visibility THEN 'granted' ELSE 'revoked' END, now());

  -- Always log display_mode choice as identity consent
  INSERT INTO consent_log VALUES (gen_random_uuid(), new.id, 'identity', 'granted', now());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_consent_audit_insert
AFTER INSERT ON public.students
FOR EACH ROW EXECUTE FUNCTION public.log_initial_consents();

-- =====================================================
-- 7. SECURITY & RLS POLICIES
-- =====================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_self_access ON students
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY records_self_access ON academic_records
FOR ALL USING (student_id = auth.uid());

CREATE POLICY subjects_self_access ON subjects
FOR ALL USING (
  record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
);

CREATE POLICY consent_log_self ON consent_log
FOR SELECT USING (student_id = auth.uid());

-- CRITICAL: Prevent users from manually inserting/editing logs.
-- Only the "log_consent_changes" trigger (Security Definer) can write here.
REVOKE INSERT, UPDATE, DELETE ON consent_log FROM authenticated;

-- =====================================================
-- 8. RANKBOARD (OPTIMIZED)
-- =====================================================
CREATE OR REPLACE VIEW public.rankboard_view AS
WITH cohort_stats AS (
  SELECT
    id,
    COUNT(*) OVER (PARTITION BY college, batch, branch) AS cohort_size
  FROM students
  WHERE consent_rankboard = true
),
semester_stats AS (
  SELECT
    ar.student_id,
    ar.semester,
    ROUND(
      SUM(COALESCE(sub.grade_point, 0) * sub.credits)::numeric / NULLIF(SUM(sub.credits), 0),
      2
    ) as sgpa,
    SUM(sub.credits) as total_credits
  FROM academic_records ar
  JOIN subjects sub ON sub.record_id = ar.id
  WHERE COALESCE(sub.grade_point, 0) > 0
  GROUP BY ar.student_id, ar.semester
),
student_cgpa AS (
  SELECT
    ss.student_id,
    ROUND(
      SUM(ss.sgpa * ss.total_credits)::numeric / NULLIF(SUM(ss.total_credits), 0),
      2
    ) as cgpa
  FROM semester_stats ss
  GROUP BY ss.student_id
)
SELECT
  s.id AS student_id,
  CASE
    WHEN s.display_mode = 'visible' THEN s.name
    WHEN s.display_mode = 'pseudonymous' THEN 'Student-' || LEFT(s.id::text, 6)
    ELSE NULL
  END AS display_name,
  s.batch,
  s.branch,
  s.college,
  sc.cgpa
FROM students s
JOIN cohort_stats cs ON cs.id = s.id
JOIN student_cgpa sc ON sc.student_id = s.id
WHERE cs.cohort_size >= 2;

REVOKE ALL ON public.rankboard_view FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_rankboard()
RETURNS TABLE (
  student_id UUID,
  display_name TEXT,
  batch TEXT,
  branch TEXT,
  college TEXT,
  cgpa NUMERIC
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public AS $$
  SELECT *
  FROM rankboard_view
  WHERE EXISTS (
    SELECT 1 FROM students
    WHERE id = auth.uid()
      AND consent_rankboard = true
      AND consent_analytics = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_rankboard() TO authenticated;

-- =====================================================
-- 9. PEER SYSTEM (DIRECTORY + MARKS)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_peers_directory()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  batch TEXT,
  branch TEXT,
  college TEXT,
  avatar_url TEXT,
  enrollment_no TEXT,
  display_mode TEXT
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public AS $$
  SELECT
    s.id,
    CASE
      WHEN s.display_mode = 'visible' THEN s.name
      WHEN s.display_mode = 'pseudonymous' THEN 'Student-' || LEFT(s.id::text, 6)
      ELSE NULL
    END,
    s.batch,
    s.branch,
    s.college,
    s.avatar_url,
    s.enrollment_no,
    s.display_mode
  FROM students s
  JOIN students me ON me.id = auth.uid()
  WHERE
    s.college = me.college
    AND s.marks_visibility = true
    AND s.marks_visibility_at IS NOT NULL
    AND me.marks_visibility = true
    AND me.marks_visibility_at IS NOT NULL
    AND s.id <> me.id;
$$;

GRANT EXECUTE ON FUNCTION public.get_peers_directory() TO authenticated;

-- Get Single Peer Profile (with mutual consent)
CREATE OR REPLACE FUNCTION public.get_peer_profile(peer_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  batch TEXT,
  branch TEXT,
  college TEXT,
  avatar_url TEXT,
  enrollment_no TEXT,
  display_mode TEXT
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public AS $$
  SELECT
    s.id,
    CASE
      WHEN s.display_mode = 'visible' THEN s.name
      WHEN s.display_mode = 'pseudonymous' THEN 'Student-' || LEFT(s.id::text, 6)
      ELSE NULL
    END,
    s.batch,
    s.branch,
    s.college,
    s.avatar_url,
    s.enrollment_no,
    s.display_mode
  FROM students s
  JOIN students me ON me.id = auth.uid()
  WHERE
    s.id = peer_id
    AND s.college = me.college
    AND s.marks_visibility = true
    AND s.marks_visibility_at IS NOT NULL
    AND me.marks_visibility = true
    AND me.marks_visibility_at IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_peer_profile(UUID) TO authenticated;

-- Helper View for Marks (Revoked from public)
CREATE OR REPLACE VIEW public.peer_marks_view AS
SELECT
  ar.student_id,
  ar.semester,
  sub.*
FROM academic_records ar
JOIN subjects sub ON sub.record_id = ar.id;

REVOKE ALL ON public.peer_marks_view FROM authenticated;

-- CORRECTED FUNCTION: Includes max_internal / max_external
CREATE OR REPLACE FUNCTION public.get_peer_subjects(peer_id UUID)
RETURNS TABLE (
  student_id UUID,
  semester INTEGER,
  id UUID,
  record_id UUID,
  code TEXT,
  name TEXT,
  internal_marks INTEGER,
  external_marks INTEGER,
  max_internal INTEGER, -- Added to match table
  max_external INTEGER, -- Added to match table
  total_marks INTEGER,
  credits INTEGER,
  grade TEXT,
  grade_point NUMERIC
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public AS $$
  SELECT
    pm.student_id,
    pm.semester,
    pm.id,
    pm.record_id,
    pm.code,
    pm.name,
    pm.internal_marks,
    pm.external_marks,
    pm.max_internal, -- Added to match table
    pm.max_external, -- Added to match table
    pm.total_marks,
    pm.credits,
    pm.grade,
    pm.grade_point
  FROM peer_marks_view pm
  JOIN students peer ON peer.id = pm.student_id
  JOIN students me ON me.id = auth.uid()
  WHERE
    peer.id = peer_id
    AND peer.college = me.college
    AND peer.marks_visibility = true
    AND peer.marks_visibility_at IS NOT NULL
    AND me.marks_visibility = true
    AND me.marks_visibility_at IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_peer_subjects(UUID) TO authenticated;

-- =====================================================
-- 10. CRITICAL PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX idx_academic_records_student_id 
ON public.academic_records(student_id);

CREATE INDEX idx_subjects_record_id 
ON public.subjects(record_id);

CREATE INDEX idx_students_cohort 
ON public.students(college, batch, branch) 
WHERE consent_rankboard = true;