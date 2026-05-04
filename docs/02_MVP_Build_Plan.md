**BCC Dashboard --- MVP Build Plan**

Version 1.0 --- May 2026

*Stack: Next.js + TypeScript + Tailwind + Supabase + Postgres*

# Guiding Philosophy

Build one complete vertical slice that works in practice before
expanding.

Everyday tasks should feel human and light. Complexity lives in the data
structure, not the interface. The system should feel lighter than
existing workflows --- not heavier.

**The test of success is not feature count. It is advisor trust.**

If Chris can run a real advising week with less cognitive load than
before --- the MVP is successful.

# The Core Loop

Everything in this build plan serves one loop:

**Student Identity → Notes Capture → AI Extraction (human-verified) →
Advisor-Verified Actions → Weekly Review**

If this loop works cleanly for real students --- the system is viable.
Everything else layers on top without rework.

# Explicitly Out of Scope for MVP

Do not build these. Do not start them. Write \"NOT MVP\" if tempted:

- Student-facing portal

- Parent-facing portal

- Rule Engine / automated advising logic

- Temporal Anchors

- Automated messaging or reminders

- Application Components UI

- Full Application Tracker

- College matching

- Advanced analytics

- GPA computation engine

- Softr or any external portal tool

- Make.com or any external automation

- Full Pathways implementation

- Cross-pathway gates

These are Phase 2 and beyond. Protect the MVP scope ruthlessly.

# Foundational Rules

Apply to every build decision:

- AI-First, Human-Verified --- AI proposes, humans approve, nothing
  reaches a student without advisor review

- Privacy by Design --- no student PII in GitHub, no real data in
  development environment by default

- Provider Independence --- every external service sits behind an
  abstraction layer

- Provenance Everywhere --- every action, extraction, and approval is
  logged

- Advisor Calm --- no surprises, no silent automation, no student
  receives anything unapproved

- Migrations for everything --- no schema changes outside of versioned
  migration files

- Dual-Key Identity --- UUID for system integrity, student_key for human
  readability. Send only id to AI.

# Current State

**MVP BUILD PLAN --- Updated Current State**

- ✅ Development environment complete (Mac M4 Pro)

- ✅ Next.js 15 + TypeScript + Tailwind initialized

- ✅ GitHub repository live (public, MIT license)

- ✅ Supabase project created and connected

- ✅ Students spine migration written and pushed

- ✅ Supabase client abstraction layer created

- ✅ Migration 002: student_key added to students

- ✅ Local Supabase (Docker) configured and running

- ✅ RLS policies written for students and notes tables

- ✅ Notes table migration written and pushed

- ✅ Weekly review queries written and tested

- ✅ Advisor dashboard (home screen) built --- three sections working

- ✅ Student detail page built --- shows notes, fields, add note button

- ✅ Notes entry interface built (TipTap editor, markdown output)

- ✅ Apple Notes zip import pipeline built and working

- ✅ CPP CSV student import built and working

- ✅ Markdown rendering for notes (react-markdown)

- ✅ lead_advisor expanded: Chris, Gav, Mark, Laura, Esther

- ⬜ AI extraction pipeline (Phase 4)

- ⬜ Email drafting pipeline (Phase 5)

- ⬜ Student detail page editing

- ⬜ Ball ownership / next ask workflow

- ⬜ Advisor accounts (pending Supabase rate limit)

- ⬜ Production deployment (Vercel)

GitHub: github.com/chrisbellco2/bcc-dashboard Supabase Project ID:
dlxbdepjbvngkgxlhcdk

# Phase 1 --- Foundation (Complete)

**Goal: System can hold a student**

## 1.1 --- Development Environment

- Mac M4 Pro with Homebrew, Git, Node, Supabase CLI, Docker

- Cursor as AI-native IDE

- GitHub repository initialized with MIT license

- Supabase cloud project created with RLS enabled

Done when: npm run dev shows app at localhost:3000 ✅

## 1.2 --- Students Spine

- Migration: 20260501203957_create_students_table.sql

- Full field set from existing Airtable schema

- Indexes on graduation_year, phase_key, status, lead_advisor

- Auto-updating updated_at trigger

- Generated full_name column

Done when: Students table visible in Supabase Table Editor ✅

# Phase 2 --- Local Environment + Security

**Goal: Safe, offline-capable development**

## 2.1 --- Local Supabase Setup

- Run supabase start to initialize Docker-based local instance

- Update .env.local to point to local database

- Confirm app runs against local database at localhost:3000

Done when: App runs fully offline with no cloud dependency

## 2.2 --- Migration 002: Add student_key

- Add student_key field to students table (format: 2027_ChrisBell_a8f3)

- Add unique constraint and index

- Write generation logic for new records

Done when: Every student record has a unique, human-readable student_key

## 2.3 --- Row Level Security

- Write RLS policies for Students table:

- Advisors can read and write all students

- Future: students read own record only

- Future: parents read child record only

- Test policies work correctly

Done when: Unauthorized access is blocked by default

## 2.4 --- First Test Student

- Add 2-3 anonymized test student records

- Confirm all fields save and retrieve correctly

- Confirm full_name computed column works

- Confirm student_key generates correctly in format
  GradYear_FirstLast_XXXX

Done when: Test students visible in Table Editor with correct data

# Phase 3 --- Weekly Student Review

**Goal: Replace the manual Monday morning stitching process**

This is the MVP milestone. When Phase 3 is complete the system delivers
real value immediately.

**The Three Questions:**

- Who has the ball? (ownership clarity)

- Who needs attention? (at-risk or inactive students)

- Who is new this week? (onboarding needed)

## 3.1 --- Notes Table Migration

Fields:

- id, student_id, author, note_date

- raw_content (verbatim text)

- note_type (Meeting, Phone, Email, Text, Zoom)

- extraction_status

- created_at, updated_at

Done when: Notes table exists with RLS policies

## 3.2 --- Weekly Review Queries

Write and test three core Postgres queries:

**Ball Check --- students without a note in the last 14 days:**

SELECT \* FROM students WHERE status = \'Active\' AND id NOT IN (SELECT
DISTINCT student_id FROM notes WHERE note_date \> now() - interval \'14
days\') ORDER BY graduation_year, last_name;

**Needs Attention --- flagged or inactive 21 days:**

SELECT \* FROM students WHERE status = \'Active\' AND (needs_attention =
true OR id NOT IN (SELECT DISTINCT student_id FROM notes WHERE note_date
\> now() - interval \'21 days\')) ORDER BY graduation_year, last_name;

**New Students --- created in the last 7 days:**

SELECT \* FROM students WHERE created_at \> now() - interval \'7 days\'
ORDER BY created_at desc;

Done when: All three queries return correct results against test data

## 3.3 --- Advisor Dashboard (First Screen)

Build the weekly review UI in Next.js:

- Three sections: New Students / Ball Check / Needs Attention

- Each section shows: student name, graduation year, phase, lead
  advisor, last contact date

- Clean, scannable, no clutter

- Tailwind styling --- warm, professional, calm

- No authentication yet (localhost only)

Done when: Chris can run a real Monday review from this screen

## 3.4 --- Student Detail Page

Basic per-student view showing:

- Name, graduation year, phase, mode, lead advisor

- List of recent notes

- List of open tasks (placeholder --- tasks table comes next)

- Last contact date

Done when: Clicking a student from the weekly review opens their detail
page

# Phase 4 --- Notes Capture + AI Extraction

**Goal: Meeting → Structured Data loop working**

## 4.1 --- Notes Entry Interface

- Simple form: student selector, date, note type, freeform text

- BCC Syntax support (!task, !deadline, #insight, #risk)

- Save note → appears immediately in student detail

Done when: Advisor can type real meeting notes and save them in under 60
seconds

## 4.2 --- Anthropic API Integration

- Install Anthropic SDK

- Create abstraction layer: lib/ai/extract.ts

- Write extraction prompt for meeting notes --- send only student id,
  never student_key or name

- Return structured JSON: tasks, insights, risks, deadlines

Done when: Pasting a real meeting note returns structured output

## 4.3 --- Extraction Staging

- AI output lands in staging --- not live records

- Each proposed item shows: Type, Proposed text, Source snippet

- Approve / Edit / Reject buttons

- Nothing creates live records without approval

Done when: Advisor can review and approve extracted items one by one

## 4.4 --- Note Extracts Table

Fields:

- id, student_id, source_note_id

- category (Task / Insight / Risk / Interest / Preference / Concern /
  Strength)

- value, normalized_value, snippet

- confidence_score

- is_active, advisor_override

- created_at

Done when: Approved extracts appear in student detail page

# Phase 5 --- Communication Drafting

**Goal: Structured data → personalized advisor-approved emails**

## 5.1 --- Email Draft Generation

- Pull relevant extracts for a student

- Build context prompt using student id only --- resolve name
  server-side, never in the prompt

- Generate draft via Claude API

- Draft lands in approval queue --- never sends automatically

Done when: Advisor can generate a personalized draft email for any
student in one click

## 5.2 --- Approval Queue

- List of pending drafts

- Preview, edit, approve, or skip each one

- Approved drafts ready to copy/send via Gmail

- All actions logged to Events Log

Done when: Advisor can process a batch of draft emails in a single
sitting

## 5.3 --- Communications Log

- Every sent communication recorded: Student, date, channel, content,
  approved by, sent by

- Visible in student detail page

- Feeds last_contact_date for weekly review

Done when: Communications history visible per student

# Definition of MVP Complete

The MVP (Phases 1-3) is complete when all of the following are true:

- An advisor can open the dashboard on Monday morning

- The three weekly review questions are answered at a glance

- Every active student has a clear owner

- Students needing attention are surfaced automatically

- New students are flagged for onboarding

- The system feels lighter than the current manual process

Phase 4 complete when a real meeting note becomes structured data in
under 2 minutes with advisor verification.

Phase 5 complete when a personalized student email can be drafted,
reviewed, and approved without opening another tool.

# Build Sequence Rules

- Finish one phase fully before starting the next

- Every schema change = a new migration file

- Every migration tested locally before supabase db push

- Commit to GitHub after every working milestone

- Never break the running app --- always leave it in a working state

- Stop rule: if a step is ambiguous, stop and clarify before building

# Commit Message Convention

feat: add Notes table migration

feat: build weekly review dashboard

fix: correct RLS policy for students

chore: update Supabase client config

docs: add Data Dictionary for Students spine

# Next Session Starting Point

- Run supabase start --- initialize local Docker database

- Update .env.local to point to local Supabase

- Run migration 002 --- add student_key field to students table

- Write RLS policies for Students table

- Add test student records

- Write Notes table migration

- Build weekly review queries

- Start advisor dashboard UI

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
