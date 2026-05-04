# BCC Dashboard — Current Project State

_Living document. Paste this into a new Claude conversation to resume instantly._
_Last updated: May 4, 2026 — End of Session 5_

---

## What This System Is

The BCC Dashboard is a Guidance & Advising Management System for Bell College 
Consulting, run by Chris Bell (IEC, Colorado Springs CO). It manages the full 
college advising lifecycle through Chris's YOU → FIT → APP model. Built to be 
given away free to the IEC community under MIT license.

It is a knowledge engine — not a CRM, not an LMS. BCC Dash is the system of 
record for all student data. External tools (CPP, Apple Notes, Zoom, etc.) are 
sources that feed it. Downstream tools and portals consume from it.

---

## Current System State

| Component | Status |
|---|---|
| Development environment (Mac M4 Pro) | Complete |
| GitHub repo | Live — github.com/chrisbellco2/bcc-dashboard |
| Next.js 15 + TypeScript + Tailwind | Running at localhost:3000 |
| Local Supabase (Docker) | Running at 127.0.0.1:54321 |
| Supabase Cloud (production) | Live, all migrations pushed |
| Students table | Complete — dual-key, RLS, trigger, all fields |
| Notes table | First tall table, live |
| Weekly Review dashboard | Built — 4 sections + All Students table |
| Student detail page | Notes history + markdown rendering |
| Notes entry interface (TipTap) | Working, tested with real data |
| CPP student import (/import-students) | Working — 34 students imported |
| Apple Notes zip import (/import-notes) | Working locally — Vercel timeout issue, fix in Session 6 |
| Authentication / login | Built |
| Vercel production deployment | Live — bcc-dashboard-jet.vercel.app |
| Inline ball_owner editing | NOT BUILT — Session 6 |
| Inline current_status editing | NOT BUILT — Session 6 |
| AI extraction pipeline | NOT BUILT — Phase 4 |
| Ingestion Layer (CPP scraper) | NOT BUILT — Phase 6+ |

---

## Current Data

- 34 active students — all 2027 grad year, all FIT phase
- 336 notes in local Supabase — full junior class Apple Notes import
- All students have last_cpp_activity populated from CPP export
- Production Supabase has students but no notes yet — Vercel timeout on zip import, fix in Session 6

---

## Migration History

| Migration | Description | Status |
|---|---|---|
| 20260501203957 | create_students_table | Both |
| 20260502130542 | add_student_key_to_students | Both |
| 20260502131426 | add_rls_policies_to_students | Both |
| 20260502133312 | add_student_key_trigger | Both |
| 20260502134631 | create_notes_table | Both |
| 20260502135109 | add_needs_attention_to_students | Both |
| 20260502212449 | add_ball_owner_and_current_status | Both |
| 20260502 (cpp) | add_cpp_fields_to_students | Both |
| NEXT — Session 6 | add_cpp_student_id_and_url | Planned |

---

## Session 6 Priorities

- Fix import-notes timeout on Vercel — refactor to streaming or chunked processing
- Inline editing — ball_owner and current_status from dashboard
- Student detail page editing — phase, mode, basic fields
- Migration: add cpp_student_id (integer) and cpp_student_url (text) to students table

---

## Key Architecture Decisions

- **Spine + Tall Table** data model — stable master tables + growing event tables
- **Dual-key identity** — UUID for system/AI calls, student_key for display
- **No PII ever to AI** — UUID only to Claude API
- **Provider independence** — every external service behind abstraction layer
- **Migrations for everything** — no schema changes outside versioned SQL files
- **No hardcoded curriculum** — BCC Core imported same as any IEC curriculum
- **BCC Dash is system of record** — sources feed in, downstream tools consume from it
- **Markdown as note format** — TipTap outputs markdown, stored and rendered as md
- **CPP is college list master** — BCC Dash reads, never overwrites
- **cpp_student_id + cpp_student_url** — permanent bridge to CPP, enables scraper
- **Ingestion Layer adapter pattern** — adapters/cpp.py is template for all sources
- **Advisor Calm** — nothing fires silently, nothing reaches students unapproved

---

## Dashboard Structure

- **New Students** — imported_on within last 7 days
- **Needs Attention** — no contact 21+ days or needs_attention = true
- **Ball is with BCC** — ball_owner = Chris or Gav
- **Ball is with Student** — ball_owner = Student
- **All Students** — complete list with status icons

---

## Team

- Chris Bell — lead advisor, system owner, primary developer
- Gav Bell — advisor (part time)
- Mark — Success Manager and advisor
- Laura — advisor
- Esther — advisor

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| Auth + API | Supabase |
| AI | Anthropic Claude API (abstracted, not yet active) |
| Version Control | Git + GitHub |
| Deployment | Vercel — bcc-dashboard-jet.vercel.app |
| IDE | Cursor |
| Local Dev | Docker + Supabase CLI |
| Ingestion scraper (planned) | Python + Playwright — local on advisor Mac |

- GitHub: github.com/chrisbellco2/bcc-dashboard
- Supabase Project ID: dlxbdepjbvngkgxlhcdk
- Local app: localhost:3000
- Local Supabase Studio: 127.0.0.1:54323

---

## Document Set

| # | Document | Status |
|---|---|---|
| 00 | Current Project State (this doc) | Living document |
| 01 | System Overview | Complete |
| 02 | MVP Build Plan | Complete |
| 03 | Data Dictionary | Complete — needs Session 3-5 field updates |
| 04 | Architecture Reference | Complete |
| 05 | Developer Guide | Complete |
| 06 | Advising Pathways Reference | Incomplete placeholder — Phase 3+ |
| 07 | ADR Reference | Incomplete placeholder — Phase 6 |
| 08 | Privacy and Governance Guide | Complete |
| 09 | Automation and AI Reference | Incomplete placeholder — Phase 4+ |
| 10 | Weekly Review Playbook | Complete |
| 11 | Release Notes | Updated through Session 5 |
| 12 | Ingestion Layer Reference | Incomplete placeholder — Phase 6+ |

---

_BCC Dashboard — Bell College Consulting_  
_Built with Claude (Sonnet 4.6) — Cursor — Next.js — Supabase — Postgres_  
_MIT License — Built to be given away_