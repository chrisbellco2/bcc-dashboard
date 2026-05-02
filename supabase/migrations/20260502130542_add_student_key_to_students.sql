-- Add student_key field to students table
-- Format: GradYear_FirstLast_XXXX (first 4 chars of UUID)

ALTER TABLE students
ADD COLUMN student_key text;

-- Generate student_key for any existing records
UPDATE students
SET student_key = graduation_year || '_' || 
                  replace(first_name || last_name, ' ', '') || '_' || 
                  substring(id::text, 1, 4);

-- Now add the unique constraint and index
ALTER TABLE students
ADD CONSTRAINT students_student_key_unique UNIQUE (student_key);

CREATE INDEX students_student_key_idx ON students(student_key);