-- Add source_filename to notes table
-- Used for deduplication during Apple Notes bulk import
-- Stores the original .md filename from Exporter

ALTER TABLE notes
ADD COLUMN source_filename text;

CREATE INDEX notes_source_filename_idx ON notes(source_filename);