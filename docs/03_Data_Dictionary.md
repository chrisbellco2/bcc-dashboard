**BCC Dashboard --- Data Dictionary**

Version 1.0 --- May 2026

*Single source of truth for all table and field definitions*

# How to Use This Document

Every table in the BCC Dashboard is documented here. For each table you
will find: Purpose, Migration file, Fields, Relationships, and Design
decisions worth remembering.

When a new migration is written, this document is updated to match. The
migration file is always the technical truth --- this document is the
human-readable explanation.

# Table Index

## Spines (Stable Master Tables)

- students ✅ Built

- phase_definitions ⬜ Planned

- curriculum_programs ⬜ Planned

- curriculum_items ⬜ Planned

- pathways ⬜ Planned

- colleges ⬜ Planned

- college_name_variants ⬜ Planned

- assessments ⬜ Planned

- opportunities ⬜ Planned

- tests ⬜ Planned

- gpa_schemes ⬜ Planned

## Tall Tables (Growing Event Tables)

- notes ⬜ Next

- student_attributes ⬜ Phase 4

- assigned_tasks ⬜ Phase 3

- communications ⬜ Phase 5

- assessment_results ⬜ Phase 4

- application_records ⬜ Phase 6

- decision_outcomes ⬜ Phase 6

- transcript_courses ⬜ Phase 6

- test_results ⬜ Phase 6

- events_log ⬜ Phase 4

## Join Tables

- student_pathways ⬜ Phase 3

## Logic Tables

- advising_rules ⬜ Post-MVP

- advising_items ⬜ Post-MVP

## Governance Tables

- governance_log ⬜ Phase 4

- import_batches ⬜ Phase 6

# 1. students

Purpose: The primary spine of the entire system. Every piece of advising
data links back to a student record. This table defines who exists in
the BCC advising universe. It must remain lean --- detailed information
lives in tall tables.

Migration: 20260501203957_create_students_table.sql

Migration 002: add_student_key_to_students.sql (next session)

Status: ✅ Live in production (student_key pending migration 002)

## Identity Fields

  --------------------------------------------------------------------------------------
  **Field**       **Type**   **Required**   **Default**         **Notes**
  --------------- ---------- -------------- ------------------- ------------------------
  id              uuid       ✅             gen_random_uuid()   Primary key. Stable
                                                                forever. Never changes
                                                                even if name changes.
                                                                Used for all foreign
                                                                keys and AI calls.

  student_key     text       ---            generated           Human-readable unique
                                                                ID. Format:
                                                                2027_ChrisBell_a8f3.
                                                                GradYear + FirstLast +
                                                                first 4 of UUID. Added
                                                                in migration 002.

  first_name      text       ✅             ---                 Legal first name

  last_name       text       ✅             ---                 Legal last name

  full_name       text       generated      ---                 Computed: first_name
                                                                \|\| \' \' \|\|
                                                                last_name. Never stored
                                                                manually.

  email           text       ---            ---                 Primary student email

  phone           text       ---            ---                 Student phone number

  date_of_birth   date       ---            ---                 Used for age
                                                                verification and
                                                                personalization
  --------------------------------------------------------------------------------------

## Dual-Key Privacy Rule

  -------------------------------------------------------------------------------
  **Key**       **Format**            **Used For**          **Never Use For**
  ------------- --------------------- --------------------- ---------------------
  id            UUID (random)         Foreign keys, AI API  Display in UI
                                      calls, system         
                                      references            

  student_key   2027_ChrisBell_a8f3   Display, debugging,   Foreign keys, AI
                                      daily advisor use     calls, exports
  -------------------------------------------------------------------------------

**Privacy rule:**

- Send to AI: id only

- Display in UI: student_key or full_name

- Foreign keys: always id

- Export/anonymize: id only, strip student_key

- GitHub/logs: never either one

## Advising State Fields

  --------------------------------------------------------------------------------------------
  **Field**                    **Type**   **Required**   **Default**       **Notes**
  ---------------------------- ---------- -------------- ----------------- -------------------
  phase_key                    text       ✅             \'PRE\'           References Phase
                                                                           Definitions spine.
                                                                           Valid: PRE, YOU,
                                                                           FIT, APP, POST

  current_mode                 text       ✅             \'Exploratory\'   Advisor stance.
                                                                           Valid: Structured,
                                                                           Exploratory,
                                                                           Reactive,
                                                                           Reflective

  lead_advisor                 text       ✅             \'Chris\'         Primary advisor.
                                                                           Valid: Chris, Gav

  primary_curriculum_program   text       ---            ---               References
                                                                           Curriculum Programs
                                                                           spine. e.g.
                                                                           BCC_CORE

  status                       text       ✅             \'Active\'        Valid: Active,
                                                                           Graduated,
                                                                           Archived, Paused
  --------------------------------------------------------------------------------------------

## Academic Fields

  -----------------------------------------------------------------------------------------
  **Field**          **Type**       **Required**   **Default**   **Notes**
  ------------------ -------------- -------------- ------------- --------------------------
  graduation_year    integer        ✅             ---           Expected high school
                                                                 graduation year. Core
                                                                 anchor for temporal logic.

  high_school_name   text           ---            ---           Free text for now. Will
                                                                 link to High Schools spine
                                                                 in Phase 6.

  unweighted_gpa     numeric(4,2)   ---            ---           School-reported unweighted
                                                                 GPA. Stored as-provided.

  weighted_gpa       numeric(4,2)   ---            ---           School-reported weighted
                                                                 GPA. Stored as-provided.

  class_rank         integer        ---            ---           Numerical rank if provided
                                                                 by school.
  -----------------------------------------------------------------------------------------

## Parent 1 Fields

  ----------------------------------------------------------------------------------------
  **Field**            **Type**   **Required**   **Default**   **Notes**
  -------------------- ---------- -------------- ------------- ---------------------------
  parent1_first_name   text       ---            ---           ---

  parent1_last_name    text       ---            ---           ---

  parent1_email        text       ---            ---           Primary family contact
                                                               email
  ----------------------------------------------------------------------------------------

## Parent 2 Fields

  ----------------------------------------------------------------------------------------
  **Field**            **Type**   **Required**   **Default**   **Notes**
  -------------------- ---------- -------------- ------------- ---------------------------
  parent2_first_name   text       ---            ---           ---

  parent2_last_name    text       ---            ---           ---

  parent2_email        text       ---            ---           ---
  ----------------------------------------------------------------------------------------

*Note: Full Parents spine with portal access planned for Phase 2. These
fields support MVP needs without overbuilding.*

## Address Fields

  --------------------------------------------------------------------------------------
  **Field**        **Type**   **Required**   **Default**   **Notes**
  ---------------- ---------- -------------- ------------- -----------------------------
  street_address   text       ---            ---           ---

  address_line2    text       ---            ---           Apt, suite etc

  city             text       ---            ---           ---

  state            text       ---            ---           Two-letter state code
                                                           preferred

  postal_code      text       ---            ---           Stored as text to support
                                                           international formats

  country          text       ---            \'USA\'       ---
  --------------------------------------------------------------------------------------

## Import and Source Tracking Fields

  -------------------------------------------------------------------------------------------
  **Field**                  **Type**      **Required**   **Default**   **Notes**
  -------------------------- ------------- -------------- ------------- ---------------------
  source_workbook_name       text          ---            ---           Name of CPP or
                                                                        spreadsheet this
                                                                        student was imported
                                                                        from

  recruitment_source         text          ---            ---           How BCC found this
                                                                        student

  original_source            text          ---            ---           Original data source
                                                                        category

  imported_on                timestamptz   ---            ---           When this record was
                                                                        first imported

  last_updated_from_source   timestamptz   ---            ---           Last time external
                                                                        source pushed an
                                                                        update

  last_extracted_on          timestamptz   ---            ---           Last time AI
                                                                        extraction ran for
                                                                        this student
  -------------------------------------------------------------------------------------------

## Internal Fields

  ------------------------------------------------------------------------------------------
  **Field**                  **Type**   **Required**   **Default**   **Notes**
  -------------------------- ---------- -------------- ------------- -----------------------
  internal_notes             text       ---            ---           Advisor-only notes.
                                                                     Never visible to
                                                                     students or parents.

  legacy_student_variables   text       ---            ---           Holding field for data
                                                                     migrated from old
                                                                     systems. Will be
                                                                     decomposed over time.
  ------------------------------------------------------------------------------------------

## Timestamp Fields

  -------------------------------------------------------------------------------------
  **Field**     **Type**      **Required**   **Default**   **Notes**
  ------------- ------------- -------------- ------------- ----------------------------
  created_at    timestamptz   ✅             now()         Set on insert, never changes

  updated_at    timestamptz   ✅             now()         Auto-updated by trigger on
                                                           any change
  -------------------------------------------------------------------------------------

## Indexes

  --------------------------------------------------------------------------------
  **Index**                      **Field**         **Purpose**
  ------------------------------ ----------------- -------------------------------
  students_graduation_year_idx   graduation_year   Filter by class year

  students_phase_key_idx         phase_key         Filter by advising phase

  students_status_idx            status            Filter active vs archived

  students_lead_advisor_idx      lead_advisor      Filter by advisor

  students_student_key_idx       student_key       Fast lookup by human-readable
                                                   key (migration 002)
  --------------------------------------------------------------------------------

## Relationships

  --------------------------------------------------------------------------
  **Related Table**     **Type**      **Via**
  --------------------- ------------- --------------------------------------
  notes                 one-to-many   notes.student_id

  student_attributes    one-to-many   student_attributes.student_id

  assigned_tasks        one-to-many   assigned_tasks.student_id

  communications        one-to-many   communications.student_id

  application_records   one-to-many   application_records.student_id

  student_pathways      one-to-many   student_pathways.student_id
  --------------------------------------------------------------------------

## Design Decisions

- Dual-key identity --- id (UUID) for all system references and AI
  calls; student_key for human display. This enforces privacy-by-design
  at the data layer.

- No formula fields --- full_name is the only computed column, handled
  natively by Postgres as a generated column

- Parent fields are lean by design --- full Parents spine with portal
  login comes in Phase 2

- GPA stored as-provided --- no computation in MVP, stored exactly as
  school reports it

- legacy_student_variables --- temporary holding field for messy
  imported data, will be decomposed as schema matures

- status field --- controls whether student appears in active views;
  archived students hidden from weekly review

# 12. notes

Purpose: The primary human input mechanism for the system. Every
meeting, phone call, email summary, Zoom AI summary, and advisor
observation flows through this table as raw text. Notes are the source
of truth for everything the advisor knows about a student. They are
preserved verbatim --- never edited after creation.

Migration: ⬜ To be written --- next session

Status: ⬜ Planned

## Identity Fields

  -----------------------------------------------------------------------------------
  **Field**    **Type**   **Required**   **Default**         **Notes**
  ------------ ---------- -------------- ------------------- ------------------------
  id           uuid       ✅             gen_random_uuid()   Primary key

  student_id   uuid       ✅             ---                 Foreign key →
                                                             students.id (always id,
                                                             never student_key)

  author       text       ✅             ---                 Who wrote the note.
                                                             Values: Chris, Gav
  -----------------------------------------------------------------------------------

## Content Fields

  -----------------------------------------------------------------------------------
  **Field**     **Type**   **Required**   **Default**   **Notes**
  ------------- ---------- -------------- ------------- -----------------------------
  note_date     date       ✅             ---           Date of the meeting or
                                                        interaction this note covers

  note_type     text       ✅             ---           Values: Meeting, Phone,
                                                        Email, Text, Zoom, Internal

  raw_content   text       ✅             ---           Verbatim note text. Never
                                                        edited after creation. The
                                                        permanent record.
  -----------------------------------------------------------------------------------

## BCC Syntax

Notes support inline tagging:

- !task --- proposed task for student or advisor

- !deadline --- date-sensitive item

- #insight --- observation about student

- #risk --- concern or flag

- #interest --- student interest noted

These tags are parsed during AI extraction. The raw_content always
preserves the original tags exactly as written.

## Extraction Fields

  ----------------------------------------------------------------------------------------
  **Field**           **Type**   **Required**   **Default**   **Notes**
  ------------------- ---------- -------------- ------------- ----------------------------
  extraction_status   text       ---            \'Pending\'   Values: Pending, Success,
                                                              Error, Needs Review, Skipped

  structured_output   jsonb      ---            ---           AI-generated JSON from
                                                              extraction. Preserved for
                                                              provenance.

  ai_model_version    text       ---            ---           Which Claude model performed
                                                              the extraction

  extraction_error    text       ---            ---           Error message if extraction
                                                              failed
  ----------------------------------------------------------------------------------------

## Timestamp Fields

  -------------------------------------------------------------------------------------
  **Field**     **Type**      **Required**   **Default**   **Notes**
  ------------- ------------- -------------- ------------- ----------------------------
  created_at    timestamptz   ✅             now()         ---

  updated_at    timestamptz   ✅             now()         Auto-updated by trigger
  -------------------------------------------------------------------------------------

## Design Decisions

- raw_content is immutable --- notes are never edited after saving.
  Corrections are new notes.

- extraction_status drives the UI --- Pending notes appear in an
  extraction queue, Error notes appear in an error view

- structured_output preserved --- even after extracts are created, the
  raw JSON is kept for provenance and debugging

- Zoom AI summaries --- ingested as note_type = \'Zoom\' with
  raw_content = the summary text

# 13. student_attributes

Purpose: The structured knowledge base for each student. One row per
fact, trait, preference, or insight known about a student. This is the
table that makes the system intelligent over time --- turning raw notes,
assessments, and interviews into clean, reusable, machine-readable
student knowledge.

Replaces: Airtable\'s Legacy Student Variables table.

Sources: AI extraction from meeting notes, assessment imports (VIA,
YouScience, MBTI, 16 Personalities), student interview imports, manual
advisor entry.

Named for what the data IS, not how it arrived. The source is tracked
per-row in source_type and source_id fields.

Migration: To be written --- Phase 4

Status: ⬜ Planned

Fields: (to be defined when migration is written --- will include
student_id, category, subcategory, value, normalized_value, source_type,
source_id, is_current, advisor_override, created_at)

## 

## Design Decisions

- Never deleted --- extracts are made inactive, not deleted. Preserves
  history of evolving student preferences.

- advisor_override --- distinguishes AI-generated from human-created
  extracts

- Multiple extracts per note --- one note can produce many extracts
  across many categories

- This table feeds everything downstream --- email drafts, student
  reports, matching logic, weekly review flags

# 14. assigned_tasks

Purpose: Discrete, trackable actions for students or advisors. Tasks are
always created from an approved source --- never automatically. They
represent the executed advising trail for each student.

Migration: ⬜ To be written --- Phase 3

Status: ⬜ Planned

## Fields

  ---------------------------------------------------------------------------------------
  **Field**        **Type**      **Required**   **Default**         **Notes**
  ---------------- ------------- -------------- ------------------- ---------------------
  id               uuid          ✅             gen_random_uuid()   Primary key

  student_id       uuid          ✅             ---                 Foreign key →
                                                                    students.id

  task_text        text          ✅             ---                 The task description

  owner            text          ✅             ---                 Values: Student,
                                                                    Advisor, Parent

  phase_key        text          ---            ---                 Which phase this task
                                                                    belongs to

  status           text          ✅             \'Open\'            Values: Open, In
                                                                    Progress, Complete,
                                                                    Skipped

  goal_date        date          ---            ---                 When this should be
                                                                    done by

  completed_date   date          ---            ---                 When it was actually
                                                                    done

  source_type      text          ---            ---                 Values: AI Extracted,
                                                                    Advisor Created, Rule
                                                                    Generated

  source_note_id   uuid          ---            ---                 Foreign key →
                                                                    notes.id if extracted
                                                                    from a note

  advisor_notes    text          ---            ---                 Internal context
                                                                    about this task

  created_at       timestamptz   ✅             now()               ---

  updated_at       timestamptz   ✅             now()               Auto-updated by
                                                                    trigger
  ---------------------------------------------------------------------------------------

# 15. communications

Purpose: A log of every communication sent to students or families.
Drafted by AI, approved by advisor, sent by advisor. Never automated.
Every communication is permanently recorded here.

Migration: ⬜ To be written --- Phase 5

Status: ⬜ Planned

## Fields

  ---------------------------------------------------------------------------------------
  **Field**            **Type**      **Required**   **Default**         **Notes**
  -------------------- ------------- -------------- ------------------- -----------------
  id                   uuid          ✅             gen_random_uuid()   Primary key

  student_id           uuid          ✅             ---                 Foreign key →
                                                                        students.id

  communication_date   date          ✅             ---                 When it was sent

  channel              text          ✅             ---                 Values: Email,
                                                                        Text, Portal,
                                                                        Phone

  subject              text          ---            ---                 Email subject if
                                                                        applicable

  content              text          ✅             ---                 Full text of
                                                                        communication

  drafted_by           text          ✅             ---                 Values: AI,
                                                                        Advisor

  approved_by          text          ✅             ---                 Advisor who
                                                                        approved before
                                                                        sending

  sent_by              text          ✅             ---                 Advisor who sent
                                                                        it

  ai_model_version     text          ---            ---                 If AI drafted,
                                                                        which model

  created_at           timestamptz   ✅             now()               ---
  ---------------------------------------------------------------------------------------

# 21. events_log

Purpose: The system\'s black box recorder. An append-only table that
documents everything the system does. Critical for debugging, auditing,
and transparency. Nothing is ever deleted from this table.

Migration: ⬜ To be written --- Phase 4

Status: ⬜ Planned

## Fields

  --------------------------------------------------------------------------------------
  **Field**      **Type**      **Required**   **Default**         **Notes**
  -------------- ------------- -------------- ------------------- ----------------------
  id             uuid          ✅             gen_random_uuid()   Primary key

  student_id     uuid          ---            ---                 Foreign key →
                                                                  students.id. Null for
                                                                  system-wide events.

  event_type     text          ✅             ---                 Values: NoteCreated,
                                                                  ExtractionCompleted,
                                                                  TaskApproved,
                                                                  CommunicationSent,
                                                                  PhaseChanged,
                                                                  AnchorUpdated,
                                                                  RuleEngineRun, Error

  description    text          ✅             ---                 Human-readable summary
                                                                  of what happened

  performed_by   text          ✅             ---                 Values: System, Chris,
                                                                  Gav

  source_type    text          ---            ---                 Values: Manual, AI,
                                                                  Rule, Import

  payload        jsonb         ---            ---                 Full context of the
                                                                  event for debugging

  created_at     timestamptz   ✅             now()               Immutable. Never
                                                                  updated.
  --------------------------------------------------------------------------------------

## Design Decisions

- Append-only --- no updates, no deletes, ever

- payload as jsonb --- flexible enough to capture any event context
  without schema changes

- student_id nullable --- system-wide events (rule engine runs, import
  batches) don\'t belong to one student

# Planned Tables --- Brief Definitions

These tables are defined conceptually but not yet built. Full field
definitions written when their migration is created.

**phase_definitions**

The advising phases stored as data not code. Allows renaming and
reordering without schema changes.

**curriculum_programs**

Advising roadmaps (BCC Core, Transfer, Light Touch). Assigned to each
student as their primary program.

**curriculum_items**

Reusable template steps in a curriculum. Not student-specific. Become
assigned_tasks when instantiated for a student.

**pathways**

Domain-specific advising frameworks (Academic, Financial, Talent etc).
Applied per student via student_pathways join table.

**student_pathways**

Join table linking students to their active pathways. Includes
activation date, deactivation date, and notes.

**colleges**

Canonical list of institutions. IPEDS ID as primary key. Permanent
attributes only --- no deadlines, no cycle-specific data.

**college_name_variants**

Alias table for college name normalization. Maps UCLA, UC Los Angeles,
University of California Los Angeles all to the same record.

**assessments**

Menu of assessment instruments (VIA, YouScience, Student Interview etc).
Defines what extractions are supported.

**assessment_results**

One row per student per assessment completion. Holds raw payload and
structured output.

**opportunities**

Pre-college programs, summer programs, fellowships. Stable across years.

**tests**

Test type definitions (SAT, ACT, AP, IB). Includes subscore schema.

**test_results**

One row per test sitting. Structured subscore fields plus JSON for
flexibility.

**transcript_courses**

One row per course per student per year. Feeds GPA computation in Phase
6.

**application_records**

One row per student per college application. Links to ADR for deadline
data.

**decision_outcomes**

Admission decisions stored separately from applications. Supports
waitlist → admit transitions.

**advising_rules**

Stored logic instructions for the rule engine. Declarative, not
procedural. Post-MVP.

**advising_items**

Proposed actions from the rule engine pending advisor approval.
Post-MVP.

**governance_log**

System-wide audit log separate from events_log. Records policy changes,
archival operations, manual overrides.

**import_batches**

One row per import attempt from any external source. Parent record for
all staging operations.

# Field Type Reference

  -----------------------------------------------------------------------
  **Type**        **Used For**
  --------------- -------------------------------------------------------
  uuid            All primary and foreign keys

  text            All string fields --- no varchar limits

  integer         Graduation year, class rank, counts

  numeric(4,2)    GPA values

  numeric(3,2)    Confidence scores (0.00-1.00)

  boolean         Flags and toggles

  date            Calendar dates without time

  timestamptz     Timestamps with timezone (always America/Denver)

  jsonb           Flexible structured data (payloads, subscores, AI
                  output)
  -----------------------------------------------------------------------

# Naming Conventions

  -----------------------------------------------------------------------
  **Convention**     **Example**
  ------------------ ----------------------------------------------------
  Table names        lowercase_snake_case, plural

  Field names        lowercase_snake_case

  Primary keys       always id

  Foreign keys       {table_singular}\_id

  Timestamp fields   created_at, updated_at

  Boolean flags      is_active, needs_attention

  Indexes            {table}\_{field}\_idx
  -----------------------------------------------------------------------

# Migration File Convention

YYYYMMDDHHMMSS_description_of_change.sql

20260501203957_create_students_table.sql

20260502_add_student_key_to_students.sql

20260503_create_notes_table.sql

20260510_create_assigned_tasks_table.sql

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
