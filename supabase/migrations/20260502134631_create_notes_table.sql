-- Notes table: primary human input mechanism
-- Raw meeting notes, phone calls, emails, Zoom summaries
-- Never edited after creation -- raw_content is the permanent record

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  author text NOT NULL,
  note_date date NOT NULL,
  note_type text NOT NULL,
  raw_content text NOT NULL,
  extraction_status text NOT NULL DEFAULT 'Pending',
  structured_output jsonb,
  ai_model_version text,
  extraction_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on changes
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX notes_student_id_idx ON notes(student_id);
CREATE INDEX notes_note_date_idx ON notes(note_date);
CREATE INDEX notes_extraction_status_idx ON notes(extraction_status);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can read all notes"
ON notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Advisors can insert notes"
ON notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Advisors can update notes"
ON notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);