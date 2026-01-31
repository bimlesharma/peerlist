-- Migration: Add privacy fields (display_mode, enrollment_no) to peer-related RPC functions
-- Purpose: Support display_mode privacy controls for peer visibility

-- Drop existing functions (required to change return types)
DROP FUNCTION IF EXISTS public.get_peers_directory();
DROP FUNCTION IF EXISTS public.get_peer_profile(UUID);

-- Recreate get_peers_directory() with display_mode and enrollment_no
CREATE FUNCTION public.get_peers_directory()
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

-- Recreate get_peer_profile() with display_mode and enrollment_no
CREATE FUNCTION public.get_peer_profile(peer_id UUID)
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

-- Note: The display_mode field already exists in the students table with CHECK constraint:
-- CHECK (display_mode = 'anonymous' OR display_mode = 'pseudonymous' OR display_mode = 'visible')
-- No table schema changes required.
