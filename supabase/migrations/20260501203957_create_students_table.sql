-- Students Spine
-- Primary table for all student records in BCC Dashboard
-- Created: 2026-05-01

create table students (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,

  -- Computed full name (use a generated column instead of storing)
  full_name text generated always as (first_name || ' ' || last_name) stored,

  -- Advising State
  phase_key text not null default 'PRE',
  current_mode text not null default 'Exploratory',
  lead_advisor text not null default 'Chris',
  primary_curriculum_program text,
  status text not null default 'Active',

  -- Academic
  graduation_year integer not null,
  high_school_name text,
  unweighted_gpa numeric(4,2),
  weighted_gpa numeric(4,2),
  class_rank integer,

  -- Parent 1
  parent1_first_name text,
  parent1_last_name text,
  parent1_email text,

  -- Parent 2
  parent2_first_name text,
  parent2_last_name text,
  parent2_email text,

  -- Address
  street_address text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'USA',

  -- Import / Source Tracking
  source_workbook_name text,
  recruitment_source text,
  original_source text,
  imported_on timestamptz,
  last_updated_from_source timestamptz,
  last_extracted_on timestamptz,

  -- Internal
  internal_notes text,
  legacy_student_variables text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index students_graduation_year_idx on students(graduation_year);
create index students_phase_key_idx on students(phase_key);
create index students_status_idx on students(status);
create index students_lead_advisor_idx on students(lead_advisor);

-- Auto-update updated_at on any row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger students_updated_at
  before update on students
  for each row
  execute function update_updated_at_column();