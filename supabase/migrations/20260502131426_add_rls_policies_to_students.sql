-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Advisors can read all students
CREATE POLICY "Advisors can read all students"
ON students
FOR SELECT
TO authenticated
USING (true);

-- Advisors can insert new students
CREATE POLICY "Advisors can insert students"
ON students
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Advisors can update students
CREATE POLICY "Advisors can update students"
ON students
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);