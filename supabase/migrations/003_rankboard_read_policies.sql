-- Migration to add RLS policies for rankboard access
-- This allows opted-in users to read other opted-in students' academic data
-- Run this in Supabase SQL Editor

-- Allow opted-in users to read academic_records of other opted-in students
CREATE POLICY "Rankboard read academic records" ON academic_records
  FOR SELECT USING (
    -- User can always read their own records
    auth.uid() = student_id
    OR
    -- User can read others' records if both have opted into rankboard
    (
      EXISTS (
        SELECT 1 FROM students WHERE id = auth.uid() AND consent_rankboard = true
      )
      AND
      EXISTS (
        SELECT 1 FROM students WHERE id = student_id AND consent_rankboard = true
      )
    )
  );

-- Allow opted-in users to read subjects of other opted-in students
CREATE POLICY "Rankboard read subjects" ON subjects
  FOR SELECT USING (
    -- User can always read their own subjects
    record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
    OR
    -- User can read others' subjects if both have opted into rankboard
    (
      EXISTS (
        SELECT 1 FROM students WHERE id = auth.uid() AND consent_rankboard = true
      )
      AND
      record_id IN (
        SELECT ar.id FROM academic_records ar
        JOIN students s ON ar.student_id = s.id
        WHERE s.consent_rankboard = true
      )
    )
  );

-- Note: If you get errors about duplicate policies, you may need to drop the old ones first:
-- DROP POLICY IF EXISTS "Users can view own records" ON academic_records;
-- DROP POLICY IF EXISTS "Users can view own subjects" ON subjects;
-- Then run the above policies which include both own-record access AND rankboard access
