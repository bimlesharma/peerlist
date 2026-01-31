-- =====================================================
-- EXTENDED SCHEMA.SQL WITH GDPR COMPLIANCE
-- Includes deletion_events table for immutable audit trail
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1A. PRIVATE SCHEMA FOR INTERNAL OBJECTS
-- =====================================================
CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM PUBLIC;

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

ALTER TABLE public.subjects
  ALTER COLUMN total_marks SET NOT NULL;

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
-- 6. DELETION EVENTS (GDPR COMPLIANCE - IMMUTABLE)
-- =====================================================
-- This table maintains permanent records of account deletions
-- for compliance and audit purposes, separate from user data.
-- CRITICAL: This table should NEVER have DELETE operations.
-- =====================================================
CREATE TABLE public.deletion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (hashed to protect privacy)
  user_id_hash TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  
  -- Deletion details
  deletion_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  deletion_reason TEXT,
  
  -- Data deleted (categories, not values)
  data_categories_deleted TEXT[] DEFAULT ARRAY['student_profile', 'academic_records', 'consent_preferences'],
  
  -- Compliance tracking
  gdpr_compliant BOOLEAN DEFAULT true,
  compliance_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  
  -- Immutability marker
  is_immutable BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.deletion_events IS 'Immutable compliance log for account deletions. Records deletion events with hashed identifiers for GDPR/data protection compliance.';
COMMENT ON COLUMN public.deletion_events.user_id_hash IS 'MD5 hash of user ID for compliance without exposing actual IDs';
COMMENT ON COLUMN public.deletion_events.email_hash IS 'MD5 hash of email for compliance verification';
COMMENT ON COLUMN public.deletion_events.is_immutable IS 'Always true. This table should never have DELETE operations.';

-- =====================================================
-- 7. TRIGGERS (AUDIT & TIMESTAMPS)
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
-- 8. COMPLIANCE FUNCTIONS
-- =====================================================

-- Log Account Deletion Event (called before deleting user data)
CREATE OR REPLACE FUNCTION public.log_account_deletion(
  p_user_id UUID,
  p_email TEXT,
  p_deletion_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_deletion_id UUID;
BEGIN
  -- Generate hashes for privacy protection using md5
  INSERT INTO public.deletion_events (
    user_id_hash,
    email_hash,
    deletion_reason,
    gdpr_compliant,
    data_categories_deleted
  ) VALUES (
    md5(p_user_id::TEXT),
    md5(p_email),
    p_deletion_reason,
    true,
    ARRAY['student_profile', 'academic_records', 'marks', 'consent_preferences', 'peer_connections']
  )
  RETURNING id INTO v_deletion_id;
  
  RETURN v_deletion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verify Deletion Compliance (called after deletion complete)
CREATE OR REPLACE FUNCTION public.verify_deletion_compliance(
  p_deletion_id UUID,
  p_verified_by TEXT DEFAULT 'system'
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.deletion_events
  SET 
    compliance_verified = true,
    verified_by = p_verified_by,
    verified_at = now()
  WHERE id = p_deletion_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get Deletion Proof (for compliance requests - anonymized)
CREATE OR REPLACE FUNCTION public.get_deletion_proof(
  p_user_email TEXT
)
RETURNS TABLE (
  deletion_date TIMESTAMPTZ,
  data_deleted TEXT[],
  compliance_verified BOOLEAN,
  verification_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    deletion_events.deletion_timestamp,
    deletion_events.data_categories_deleted,
    deletion_events.compliance_verified,
    deletion_events.verified_at
  FROM public.deletion_events
  WHERE deletion_events.email_hash = md5(p_user_email)
  AND deletion_events.gdpr_compliant = true
  ORDER BY deletion_events.deletion_timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 9. SECURITY & RLS POLICIES
-- =====================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_events ENABLE ROW LEVEL SECURITY;

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
REVOKE INSERT, UPDATE, DELETE ON public.consent_log FROM PUBLIC;

-- Force RLS on key tables
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_events FORCE ROW LEVEL SECURITY;

-- Deletion Events: Admin can view, Service role can INSERT, no one can UPDATE/DELETE
CREATE POLICY deletion_events_admin_view ON deletion_events
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY deletion_events_service_insert ON deletion_events
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY deletion_events_user_no_insert ON deletion_events
FOR INSERT TO authenticated, anon WITH CHECK (false);

CREATE POLICY deletion_events_no_modify ON deletion_events
FOR UPDATE USING (false);

CREATE POLICY deletion_events_no_delete ON deletion_events
FOR DELETE USING (false);

-- Explicitly revoke and re-grant deletion_events permissions
REVOKE ALL ON public.deletion_events FROM PUBLIC;
REVOKE ALL ON public.deletion_events FROM authenticated;
GRANT INSERT ON public.deletion_events TO service_role;

-- Prevent UPDATE/DELETE even from owners
CREATE OR REPLACE RULE deletion_events_no_update AS
ON UPDATE TO public.deletion_events DO INSTEAD NOTHING;

CREATE OR REPLACE RULE deletion_events_no_delete AS
ON DELETE TO public.deletion_events DO INSTEAD NOTHING;

-- =====================================================
-- 10. RANKBOARD (OPTIMIZED)
-- =====================================================
CREATE OR REPLACE VIEW internal.rankboard_view AS
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

REVOKE ALL ON internal.rankboard_view FROM authenticated;

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
SECURITY DEFINER SET search_path = internal, public AS $$
  SELECT *
  FROM internal.rankboard_view
  WHERE EXISTS (
    SELECT 1 FROM students
    WHERE id = auth.uid()
      AND consent_rankboard = true
      AND consent_analytics = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_rankboard() TO authenticated;

-- =====================================================
-- 11. PEER SYSTEM (DIRECTORY + MARKS)
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
CREATE OR REPLACE VIEW internal.peer_marks_view AS
SELECT
  ar.student_id,
  ar.semester,
  sub.*
FROM academic_records ar
JOIN subjects sub ON sub.record_id = ar.id;

REVOKE ALL ON internal.peer_marks_view FROM authenticated;

-- Get Peer Subjects (with mutual consent)
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
  max_internal INTEGER,
  max_external INTEGER,
  total_marks INTEGER,
  credits INTEGER,
  grade TEXT,
  grade_point NUMERIC
)
LANGUAGE sql
SECURITY DEFINER SET search_path = internal, public AS $$
  SELECT
    pm.student_id,
    pm.semester,
    pm.id,
    pm.record_id,
    pm.code,
    pm.name,
    pm.internal_marks,
    pm.external_marks,
    pm.max_internal,
    pm.max_external,
    pm.total_marks,
    pm.credits,
    pm.grade,
    pm.grade_point
  FROM internal.peer_marks_view pm
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
-- 12. CRITICAL PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX idx_academic_records_student_id 
ON public.academic_records(student_id);

CREATE INDEX idx_subjects_record_id 
ON public.subjects(record_id);

CREATE INDEX idx_students_cohort 
ON public.students(college, batch, branch) 
WHERE consent_rankboard = true;

-- Deletion Events Indexes
CREATE INDEX IF NOT EXISTS idx_deletion_events_timestamp ON public.deletion_events(deletion_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_events_user_hash ON public.deletion_events(user_id_hash);
CREATE INDEX IF NOT EXISTS idx_deletion_events_compliance ON public.deletion_events(compliance_verified);
CREATE INDEX IF NOT EXISTS idx_deletion_events_unverified 
  ON public.deletion_events(id) 
  WHERE compliance_verified = false;

-- =====================================================
-- 13. GRANT EXECUTION PRIVILEGES
-- =====================================================
GRANT EXECUTE ON FUNCTION public.log_account_deletion(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_deletion_compliance(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_deletion_proof(TEXT) TO authenticated;

COMMENT ON SCHEMA internal IS
'Private schema for SECURITY DEFINER views. Not exposed via Supabase API.';
