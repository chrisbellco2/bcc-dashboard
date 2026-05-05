-- Create assigned_tasks tall table
CREATE TABLE assigned_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  task_text text NOT NULL,
  owner text NOT NULL,
  phase_key text,
  status text NOT NULL DEFAULT 'Open',
  goal_date date,
  completed_date date,
  source_type text,
  source_note_id uuid REFERENCES notes(id),
  advisor_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX assigned_tasks_student_id_idx ON assigned_tasks(student_id);
CREATE INDEX assigned_tasks_status_idx ON assigned_tasks(status);
CREATE INDEX assigned_tasks_owner_idx ON assigned_tasks(owner);

-- Auto-update updated_at
CREATE TRIGGER update_assigned_tasks_updated_at
  BEFORE UPDATE ON assigned_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can read and write all tasks"
  ON assigned_tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);