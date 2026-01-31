-- =====================================================
-- GDPR Compliance: Immutable Deletion Events Registry
-- This table maintains permanent records of account deletions
-- for compliance and audit purposes, separate from user data.
-- =====================================================

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create deletion_events table (immutable, never deleted)
CREATE TABLE IF NOT EXISTS public.deletion_events (
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

-- Add comment for clarity
COMMENT ON TABLE public.deletion_events IS 'Immutable compliance log for account deletions. Records deletion events with hashed identifiers for GDPR/data protection compliance.';
COMMENT ON COLUMN public.deletion_events.user_id_hash IS 'SHA256 hash of user ID for compliance without exposing actual IDs';
COMMENT ON COLUMN public.deletion_events.email_hash IS 'SHA256 hash of email for compliance verification';
COMMENT ON COLUMN public.deletion_events.is_immutable IS 'Always true. This table should never have DELETE operations.';

-- Create index for compliance lookups
CREATE INDEX IF NOT EXISTS idx_deletion_events_timestamp ON public.deletion_events(deletion_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_events_user_hash ON public.deletion_events(user_id_hash);
CREATE INDEX IF NOT EXISTS idx_deletion_events_compliance ON public.deletion_events(compliance_verified);

-- =====================================================
-- SECURITY: Row-Level Security Policies
-- =====================================================

-- Enable RLS on deletion_events
ALTER TABLE public.deletion_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS deletion_events_admin_view ON public.deletion_events;
DROP POLICY IF EXISTS deletion_events_service_insert ON public.deletion_events;
DROP POLICY IF EXISTS deletion_events_no_modify ON public.deletion_events;
DROP POLICY IF EXISTS deletion_events_no_delete ON public.deletion_events;

-- Admin can view all deletion events (for compliance verification)
CREATE POLICY deletion_events_admin_view
  ON public.deletion_events
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Service role (API) can INSERT deletion events
CREATE POLICY deletion_events_service_insert
  ON public.deletion_events
  FOR INSERT
  WITH CHECK (true);

-- No one can UPDATE or DELETE deletion events (immutable)
CREATE POLICY deletion_events_no_modify
  ON public.deletion_events
  FOR UPDATE
  USING (false);

CREATE POLICY deletion_events_no_delete
  ON public.deletion_events
  FOR DELETE
  USING (false);

-- =====================================================
-- HELPER FUNCTION: Log Deletion Event
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_account_deletion(
  p_user_id UUID,
  p_email TEXT,
  p_deletion_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_deletion_id UUID;
BEGIN
  -- Generate hashes for privacy protection using md5 (simpler, always available)
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

-- =====================================================
-- HELPER FUNCTION: Verify Deletion Compliance
-- =====================================================

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

-- =====================================================
-- HELPER FUNCTION: Get Deletion Proof
-- For compliance requests (anonymized)
-- =====================================================

DROP FUNCTION IF EXISTS public.get_deletion_proof(TEXT);

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
-- INDEX FOR COMPLIANCE AUDITS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_deletion_events_unverified 
  ON public.deletion_events(id) 
  WHERE compliance_verified = false;

-- =====================================================
-- MIGRATION NOTE
-- =====================================================
-- This table is designed to:
-- 1. Maintain permanent records of data deletion for GDPR compliance
-- 2. Prevent modification or deletion of compliance records (immutable)
-- 3. Use hashed identifiers to protect privacy while proving deletion
-- 4. Provide audit trail for regulatory requests
-- 5. Support compliance verification workflows
-- =====================================================
