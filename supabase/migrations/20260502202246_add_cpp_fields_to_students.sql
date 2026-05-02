-- Add CPP sync fields to students table
-- These fields are owned by CPP import -- never manually edited

ALTER TABLE students
ADD COLUMN last_cpp_activity date,
ADD COLUMN last_cpp_login text;

CREATE INDEX students_last_cpp_activity_idx ON students(last_cpp_activity);