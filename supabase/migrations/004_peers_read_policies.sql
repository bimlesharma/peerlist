-- Migration to add RLS policies for peers/marks sharing access
-- This allows students who have opted to share marks (marks_visibility = true)
-- to read each other's profiles and academic data
-- Run this in Supabase SQL Editor

-- Allow marks-sharing users to read other marks-sharing students' profiles
-- Note: This extends the existing "Rankboard read for opted-in users" policy
CREATE POLICY "Peers read student profiles" ON students
  FOR SELECT USING (
    -- User can always read their own profile
    auth.uid() = id
    OR
    -- User can read others' profiles if both have opted to share marks
    (
      marks_visibility = true
      AND
      EXISTS (
        SELECT 1 FROM students WHERE id = auth.uid() AND marks_visibility = true
      )
    )
  );

-- Allow marks-sharing users to read academic_records of other marks-sharing students
CREATE POLICY "Peers read academic records" ON academic_records
  FOR SELECT USING (
    -- User can always read their own records
    auth.uid() = student_id
    OR
    -- User can read others' records if both have opted to share marks
    (
      EXISTS (
        SELECT 1 FROM students WHERE id = auth.uid() AND marks_visibility = true
      )
      AND
      EXISTS (
        SELECT 1 FROM students WHERE id = student_id AND marks_visibility = true
      )
    )
  );

-- Allow marks-sharing users to read subjects of other marks-sharing students
CREATE POLICY "Peers read subjects" ON subjects
  FOR SELECT USING (
    -- User can always read their own subjects
    record_id IN (SELECT id FROM academic_records WHERE student_id = auth.uid())
    OR
    -- User can read others' subjects if both have opted to share marks
    (
      EXISTS (
        SELECT 1 FROM students WHERE id = auth.uid() AND marks_visibility = true
      )
      AND
      record_id IN (
        SELECT ar.id FROM academic_records ar
        JOIN students s ON ar.student_id = s.id
        WHERE s.marks_visibility = true
      )
    )
  );

-- Note: If you get errors about duplicate policies, you may need to drop conflicting ones:
-- DROP POLICY IF EXISTS "Users can view own profile" ON students;
-- DROP POLICY IF EXISTS "Rankboard read for opted-in users" ON students;
-- DROP POLICY IF EXISTS "Users can view own records" ON academic_records;
-- DROP POLICY IF EXISTS "Rankboard read academic records" ON academic_records;
-- DROP POLICY IF EXISTS "Users can view own subjects" ON subjects;
-- DROP POLICY IF EXISTS "Rankboard read subjects" ON subjects;
-- Then run the above policies which include combined access logic
