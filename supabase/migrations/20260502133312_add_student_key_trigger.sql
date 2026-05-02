-- Function to generate student_key on insert
CREATE OR REPLACE FUNCTION generate_student_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.student_key := NEW.graduation_year || '_' || 
                     replace(NEW.first_name || NEW.last_name, ' ', '') || '_' || 
                     substring(NEW.id::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that fires on every new student insert
CREATE TRIGGER set_student_key
  BEFORE INSERT ON students
  FOR EACH ROW
  WHEN (NEW.student_key IS NULL)
  EXECUTE FUNCTION generate_student_key();