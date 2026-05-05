-- Drop ball_owner and current_status, add two-sided action fields
ALTER TABLE students
  DROP COLUMN IF EXISTS ball_owner,
  DROP COLUMN IF EXISTS current_status,
  ADD COLUMN advisor_action text,
  ADD COLUMN student_action text;