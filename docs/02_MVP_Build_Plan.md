# BCC Dashboard — MVP Build Plan

Version 2.0 — May 2026

_Stack: Next.js + TypeScript + Tailwind + Supabase + Postgres_

---

# Guiding Philosophy

Build one complete vertical slice that works in practice before expanding.

Everyday tasks should feel human and light. Complexity lives in the data structure, not the interface. The system should feel lighter than existing workflows — not heavier.

**The test of success is not feature count. It is advisor trust.**

If Chris can run a real advising week with less cognitive load than before — the MVP is successful.

---

# The Core Loop

Everything in this build plan serves one loop:

**Student Identity → Notes Capture → AI Extraction (human-verified) → Advisor-Verified Actions → Weekly Review**

If this loop works cleanly for real students — the system is viable. Everything else layers on top without rework.

---

# Explicitly Out of Scope for MVP

Do not build these. Do not start them. Write "NOT MVP" if tempted:

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

---

# Foundational Rules

Apply to every build decision:

- **AI-First, Human-Verified** — AI proposes, humans approve, nothing reaches a student without advisor review
- **Privacy by Design** — no student PII in GitHub, no real data in development environment by default
- **Provider Independence** — every external service sits behind an abstraction layer
- **Provenance Everywhere** — every action, extraction, and approval is logged
- **Advisor Calm** — no surprises, no silent automation, no student receives anything unapproved
- **Migrations for everything** — no schema changes outside of versioned migration files
- **Dual-Key Identity** — UUID for system integrity, student_key for human readability. Send only id to AI.
- **Build it right now** — when the correct data model is clear, build it correctly rather than take a shortcut that requires migration later

---

# Current State

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
- ✅ Advisor dashboard (home screen) built
- ✅ Student detail page built — shows notes, fields, add note button
- ✅ Notes entry interface built (TipTap editor, markdown output)
- ✅ Apple Notes zip import pipeline built and working
- ✅ CPP CSV student import built and working
- ✅ Markdown rendering for notes (react-markdown)
- ✅ lead_advisor expanded: Chris, Gav, Mark, Laura, Esther
- ✅ Authentication / login built
- ✅ Vercel production deployment live
- ⬜ Drop ball_owner, add advisor_action + student_action fields
- ⬜ assigned_tasks table (moved up — build correctly now)
- ⬜ Dashboard redesign — new four-section action model
- ⬜ Inline action field editing from dashboard
- ⬜ Student detail page editing
- ⬜ Apple Notes zip import fix for Vercel timeout
- ⬜ AI extraction pipeline (Phase 4)
- ⬜ Email drafting pipeline (Phase 5)

GitHub: github.com/chrisbellco2/bcc-dashboard
Supabase Project ID: dlxbdepjbvngkgxlhcdk

---

# Phase 1 — Foundation (Complete ✅)

**Goal: System can hold a student**

Done when: Students table visible in Supabase Table Editor ✅

---

# Phase 2 — Local Environment + Security (Complete ✅)

**Goal: Safe, offline-capable development**

Done when: App runs fully offline, RLS enforced, test students in place ✅

---

# Phase 3 — Weekly Student Review (In Progress)

**Goal: Replace the manual Monday morning stitching process**

This is the MVP milestone. When Phase 3 is complete the system delivers real value immediately.

**The Two Core Questions:**
- Do I have something to do for this student?
- Does the student have something to do?

## 3.1 — Notes Table Migration ✅

Complete. Notes table live with RLS policies.

## 3.2 — Weekly Review Queries ✅

Core queries written and tested.

## 3.3 — Advisor Dashboard (First Screen) ✅

Initial dashboard built. Redesign required per new action model — see 3.5.

## 3.4 — Student Detail Page ✅

Basic per-student view showing notes history, fields, add note button.

## 3.5 — Action Fields on Students (Session 6)

Replace `ball_owner` with two-sided action model:

- Migration: drop `ball_owner`, add `advisor_action` (text, nullable) and `student_action` (text, nullable)
- `advisor_action`: brief text describing what the advisor needs to do next. Null = no action.
- `student_action`: brief text describing what the student needs to do next. Null = no action.
- No ownership field. No metaphor. Section placement is derived from field values.

Dashboard sections:
- **Both active** — both fields have a value
- **Needs Attention** — both null + 21 days no contact or manually flagged
- **Advisor has action** — advisor_action set, student_action null
- **Student has action** — student_action set, advisor_action null
- **All Students** — complete list

Each row shows two pills: advisor action (blue) and student action (amber). Muted when empty.

In a future phase, AI extraction will read meeting notes and suggest updates to both action fields.

Done when: Advisor can update action fields from dashboard and sections update correctly

## 3.6 — assigned_tasks Table (Session 6)

Build the assigned_tasks tall table now, before the action fields are in use. This is the correct data home for the full task history. The action fields on students are a lightweight dashboard surface — assigned_tasks is the foundation.

Fields:
- id, student_id, task_text, owner (Advisor / Student / Parent / Other)
- phase_key, status (Open / In Progress / Complete / Skipped)
- goal_date, completed_date
- source_type (Advisor Created / AI Extracted / Rule Generated)
- source_note_id (foreign key → notes.id if extracted from a note)
- advisor_notes, created_at, updated_at

Done when: assigned_tasks table exists and is visible in Supabase

Done when (Phase 3 complete): Chris can run a real Monday review from the dashboard with accurate action status per student

---

# Phase 4 — Notes Capture + AI Extraction

**Goal: Meeting → Structured Data loop working**

## 4.1 — Notes Entry Interface ✅

Built. TipTap editor, markdown output, saves in under 60 seconds.

## 4.2 — Anthropic API Integration

- Install Anthropic SDK
- Create abstraction layer: lib/ai/extract.ts
- Write extraction prompt for meeting notes — send only student id, never student_key or name
- Return structured JSON: tasks, insights, risks, deadlines
- AI will eventually suggest advisor_action and student_action values from note content

Done when: Pasting a real meeting note returns structured output

## 4.3 — Extraction Staging

- AI output lands in staging — not live records
- Each proposed item shows: Type, Proposed text, Source snippet
- Approve / Edit / Reject buttons
- Nothing creates live records without approval

Done when: Advisor can review and approve extracted items one by one

## 4.4 — student_attributes Table

Fields:
- id, student_id, source_note_id
- category (Task / Insight / Risk / Interest / Preference / Concern / Strength / Value / Goal)
- subcategory, value, normalized_value, snippet
- confidence_score, is_active, advisor_override
- created_at

Done when: Approved extracts appear in student detail page

---

# Phase 5 — Communication Drafting

**Goal: Structured data → personalized advisor-approved emails**

## 5.1 — Email Draft Generation

- Pull relevant extracts for a student
- Build context prompt using student id only — resolve name server-side, never in the prompt
- Generate draft via Claude API
- Draft lands in approval queue — never sends automatically

Done when: Advisor can generate a personalized draft email for any student in one click

## 5.2 — Approval Queue

- List of pending drafts
- Preview, edit, approve, or skip each one
- Approved drafts ready to copy/send via Gmail
- All actions logged to Events Log

Done when: Advisor can process a batch of draft emails in a single sitting

## 5.3 — Communications Log

- Every sent communication recorded: Student, date, channel, content, approved by, sent by
- Visible in student detail page
- Feeds last_contact_date for weekly review

Done when: Communications history visible per student

---

# Definition of MVP Complete

The MVP (Phases 1-3) is complete when all of the following are true:

- An advisor can open the dashboard on Monday morning
- The two weekly review questions are answered at a glance for every student
- Students needing attention are surfaced automatically
- New students are flagged for onboarding
- Action fields are editable inline from the dashboard
- The system feels lighter than the current manual process

Phase 4 complete when a real meeting note becomes structured data in under 2 minutes with advisor verification.

Phase 5 complete when a personalized student email can be drafted, reviewed, and approved without opening another tool.

---

# Build Sequence Rules

- Finish one phase fully before starting the next
- Every schema change = a new migration file
- Every migration tested locally before supabase db push
- Commit to GitHub after every working milestone
- Never break the running app — always leave it in a working state
- Stop rule: if a step is ambiguous, stop and clarify before building
- Build it right rule: if the correct data model is clear, build it now rather than shortcut and migrate later

---

# Commit Message Convention

```
feat: add action fields to students table
feat: rebuild weekly review dashboard sections
feat: add assigned_tasks table migration
fix: correct RLS policy for students
chore: update Supabase client config
docs: update Data Dictionary for action fields
```

---

_BCC Dashboard — Bell College Consulting_
_Built with Claude (Sonnet 4.6) — Cursor — Next.js — Supabase — Postgres_
_MIT License — Built to be given away_
