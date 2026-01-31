-- =====================================================
-- Student Academic Analytics Platform - Database Schema
-- =====================================================
-- Run this SQL in Supabase SQL Editor to set up the database
-- Make sure to enable Google OAuth in Authentication > Providers

-- 1. Students Table
-- -----------------
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  enrollment_no TEXT UNIQUE NOT NULL,
  batch TEXT,
  branch TEXT,
  college TEXT,
  -- Consent flags
  consent_analytics BOOLEAN DEFAULT false,
  consent_rankboard BOOLEAN DEFAULT false,
  display_mode TEXT DEFAULT 'anonymous' 
    CHECK (display_mode IN ('anonymous', 'pseudonymous', 'visible')),
  -- Explicit marks visibility (extra confirmation required)
  marks_visibility BOOLEAN DEFAULT false,
  marks_visibility_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Academic Records Table
-- -------------------------
CREATE TABLE academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_no TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- CRITICAL: Prevent duplicate semester entries per student
  UNIQUE(student_id, semester)
);

-- 3. Subjects Table
-- -----------------
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES academic_records(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  internal_marks INTEGER CHECK (internal_marks >= 0 AND internal_marks <= 40),
  external_marks INTEGER CHECK (external_marks >= 0 AND external_marks <= 60),
  total_marks INTEGER,
  credits INTEGER NOT NULL CHECK (credits >= 1 AND credits <= 6),
  grade TEXT,
  grade_point DECIMAL(3,1) CHECK (grade_point >= 0 AND grade_point <= 10)
);

-- 4. Consent Audit Log Table
-- --------------------------
CREATE TABLE consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('analytics', 'rankboard', 'marks_visibility')),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

-- Students: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON students
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON students
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON students
  FOR DELETE USING (auth.uid() = id);

-- Academic Records: Users can only access their own records
-- PLUS: Opted-in rankboard users can view other opted-in users' records
CREATE POLICY "Users can view own records" ON academic_records
  FOR SELECT USING (
    auth.uid() = student_id
    OR
    (
      EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND consent_rankboard = true)
      AND
      EXISTS (SELECT 1 FROM students WHERE id = student_id AND consent_rankboard = true)
    )
  );

CREATE POLICY "Users can insert own records" ON academic_records
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can delete own records" ON academic_records
  FOR DELETE USING (auth.uid() = student_id);

-- Subjects: Users can only access subjects in their own records
-- PLUS: Opted-in rankboard users can view other opted-in users' subjects
CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT USING (
    record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
    OR
    (
      EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND consent_rankboard = true)
      AND
      record_id IN (
        SELECT ar.id FROM academic_records ar
        JOIN students s ON ar.student_id = s.id
        WHERE s.consent_rankboard = true
      )
    )
  );

CREATE POLICY "Users can insert own subjects" ON subjects
  FOR INSERT WITH CHECK (
    record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
  );

CREATE POLICY "Users can delete own subjects" ON subjects
  FOR DELETE USING (
    record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
  );

-- Consent Log: Users can only view their own logs
CREATE POLICY "Users can view own consent logs" ON consent_log
  FOR SELECT USING (auth.uid() = student_id);

-- =====================================================
-- Consent Audit Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.consent_analytics IS DISTINCT FROM NEW.consent_analytics THEN
    INSERT INTO consent_log (student_id, consent_type, action)
    VALUES (NEW.id, 'analytics', CASE WHEN NEW.consent_analytics THEN 'granted' ELSE 'revoked' END);
  END IF;
  
  IF OLD.consent_rankboard IS DISTINCT FROM NEW.consent_rankboard THEN
    INSERT INTO consent_log (student_id, consent_type, action)
    VALUES (NEW.id, 'rankboard', CASE WHEN NEW.consent_rankboard THEN 'granted' ELSE 'revoked' END);
  END IF;
  
  IF OLD.marks_visibility IS DISTINCT FROM NEW.marks_visibility THEN
    INSERT INTO consent_log (student_id, consent_type, action)
    VALUES (NEW.id, 'marks_visibility', CASE WHEN NEW.marks_visibility THEN 'granted' ELSE 'revoked' END);
    -- Also update timestamp when enabling
    NEW.marks_visibility_at := CASE WHEN NEW.marks_visibility THEN NOW() ELSE NULL END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER consent_audit_trigger
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION log_consent_change();

-- =====================================================
-- Rankboard Safe View (Only expose safe fields)
-- =====================================================

-- Students can see other opted-in students' basic data for rankboard
CREATE POLICY "Rankboard read for opted-in users" ON students
  FOR SELECT USING (
    consent_rankboard = true 
    AND EXISTS (
      SELECT 1 FROM students WHERE id = auth.uid() AND consent_rankboard = true
    )
  );

-- =====================================================
-- Instructions
-- =====================================================
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Providers
-- 3. Enable GitHub OAuth:
--    - Create OAuth App at github.com/settings/developers
--    - Homepage URL: http://localhost:3000
--    - Callback URL: https://your-project.supabase.co/auth/v1/callback
--    - Copy Client ID and Client Secret to Supabase
-- 4. Copy your Project URL and anon key from Settings > API
-- 5. Add to .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=your-url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
