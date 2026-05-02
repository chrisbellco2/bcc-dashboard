-- Add ball_owner and current_status to students table
-- ball_owner: who currently has the next action
-- current_status: freeform one-liner replacing "Task 1" in current spreadsheet

ALTER TABLE students
ADD COLUMN ball_owner text NOT NULL DEFAULT 'Student',
ADD COLUMN current_status text;

CREATE INDEX students_ball_owner_idx ON students(ball_owner);