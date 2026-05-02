ALTER TABLE students
ADD COLUMN needs_attention boolean NOT NULL DEFAULT false;

CREATE INDEX students_needs_attention_idx ON students(needs_attention);