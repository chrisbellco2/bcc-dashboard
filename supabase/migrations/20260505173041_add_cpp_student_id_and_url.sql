-- Add CPP bridge fields to students
ALTER TABLE students
  ADD COLUMN cpp_student_id integer,
  ADD COLUMN cpp_student_url text;

CREATE INDEX students_cpp_student_id_idx ON students(cpp_student_id);