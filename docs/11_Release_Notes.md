# BCC Dashboard — Release Notes

Living Document — Started May 1, 2026

_Running changelog of all builds and changes_

_This document is updated after every significant build session. It records what was built, what decisions were made, and what assumptions were carried forward. It is both a technical changelog and a decision log._

---

# How to Read This Document

Entries are in reverse chronological order — newest first. Each entry includes:
- Date and session description
- What was built or changed
- Decisions made (and why)
- Assumptions made (flagged for later review)
- What is next

---

## Pre-Session 6 Design — May 5, 2026

_Action Model Design — Replacing ball_owner with two-sided action fields_

> No code written. Pure design work. A significant architectural improvement emerged from a conversation about naming the "ball" concept for a generic IEC tool.

### What Was Designed

The `ball_owner` field was replaced entirely with a two-sided action model. This change emerged from trying to find a universal, professional term for "who has the ball" — and realizing the underlying concept was architecturally incomplete.

**The core insight:** The weekly review is really answering two independent questions:
1. Do I (the advisor) have something to do for this student?
2. Does the student have something to do?

These are not mutually exclusive. Both can be true simultaneously. A single "owner" field forces a false binary that doesn't reflect reality.

**The new model:**
- `advisor_action` (text, nullable) — what the advisor needs to do next. Null = no action.
- `student_action` (text, nullable) — what the student needs to do next. Null = no action.
- Null is the boolean. No separate boolean ownership flag needed.
- Dashboard section placement is derived entirely from these two fields.

**Dashboard sections (new):**
- **Both Active** — both fields have a value
- **Needs Attention** — both null + 21 days no contact or manually flagged
- **Advisor Has Action** — advisor_action set, student_action null
- **Student Has Action** — student_action set, advisor_action null
- **All Students** — complete list

Each row shows two pills: advisor action (blue) and student action (amber). Muted when empty. No student appears in more than one section.

**What was also decided:**
- `assigned_tasks` tall table moved up to Session 6 — build the correct foundation now rather than shortcut and migrate later
- Action fields on students are lightweight surface fields; assigned_tasks is the proper data home for full task history
- In a future phase, AI extraction will suggest values for both action fields from meeting note content
- The `ball_owner` field will be dropped in a Session 6 migration

### Architecture Decisions Made

| Decision | Rationale |
|---|---|
| Replace ball_owner with advisor_action + student_action | Single ownership field is a false binary. Both sides can have active work simultaneously. Two fields reflects reality. |
| Null as boolean | Text present = action exists. Null = no action. A separate boolean would be redundant and require two fields to stay in sync. |
| No ownership field | Ownership was redundant once both action pills are visible. Section placement is derived from field values alone. |
| Build assigned_tasks now | The correct data home for tasks exists in the design. Building a shortcut now would require migration later. Discipline over expedience. |
| Terminology: advisor_action / student_action | Professional, universal, portable to any IEC practice. No sports metaphors, no jargon. |

### Naming Exploration Summary

The following terms were explored and rejected before arriving at the final model:

| Term | Reason Rejected |
|---|---|
| ball | Too colloquial, not universally understood |
| court | Still a sports metaphor |
| waiting_on | "Waiting" is passive; implies stuck rather than in-motion |
| next_move | Points to an action, not a person — answer would be a task, not a name |
| ownership | Redundant once two-pill model is in place |
| with | Elegant but too implicit for a generic tool used by strangers |
| onus | Too obscure for a generic tool |

The realization that led to the final design: the question isn't "who owns this?" — it's two separate questions that need two separate fields.

### What Is Next (Session 6)

- Migration: drop `ball_owner`, add `advisor_action` and `student_action` to students table
- Migration: create `assigned_tasks` table
- Migration: add `cpp_student_id` and `cpp_student_url` to students table
- Rebuild dashboard sections to reflect new four-section model
- Inline editing of action fields from dashboard
- Fix Apple Notes zip import Vercel timeout
- Student detail page field editing

---

## Session 5 — May 4, 2026

_Ingestion Layer Exploration — CPP Tour, Architecture Design_

> No code written this session. Pure architecture exploration. The 4:15am wake-up that produced the Ingestion Layer vision.

### What Was Explored and Decided

- Full tour of College Planner Pro (CPP) — students list, student detail page, meetings, notes, college list, removed colleges popup, all report exports
- Ingestion Layer mental model established: BCC Dash is destination, all tools are sources
- CPP data inventory completed — exportable vs scraping required
- Three-tier ingestion architecture designed
- Python + Playwright selected as scraper stack
- Graceful degradation pattern designed for Mark and non-local users
- Adapter pattern established for CounselMore, Maia, and future sources
- Sankey diagram goal confirmed — college list history data supports it
- Document 12 (Ingestion Layer Reference) created as placeholder

### Architecture Decisions Made

| Decision | Rationale |
|---|---|
| BCC Dash is destination, all tools are sources | Action happens in CPP, Apple Notes, etc. Data flows to BCC Dash. BCC Dash builds the whole picture. |
| Ingestion Layer as top-level capability with domains | Student domain first. College domain next. Each follows the same adapter pattern. |
| Three ingestion tiers | Tier 1: CSV import UI. Tier 2: Python + Playwright scraper. Tier 3: One Button sync in dashboard. |
| Python + Playwright for scraper | Best ecosystem for web scraping. Separate service from Next.js. Writes to same Supabase DB. |
| Run scraper locally first | Simplest and most reliable. Move to cloud VPS only when needed. |
| Graceful degradation for non-local users | Button pings localhost:8000/health. No response = message box + manual CSV fallback. Mark is not blocked. |
| Store both cpp_student_id AND cpp_student_url | ID (e.g. 1468) is stable truth. Full URL is navigation convenience. Both stored. |
| Adapter pattern for extensibility | adapters/cpp.py is the template. CounselMore, Maia etc. output same normalized shape. BCC Dash unchanged. |
| College list is highest-value scrape target | Structured, changes over time, not available via export. Supports Sankey diagram goal. |
| No scheduled scraping — advisor-triggered only | Advisor Calm applied to ingestion. Scheduled scrapers fail silently. Triggered scrapers fail loudly. |

### CPP Data Inventory

| Source | Contains | BCC Dash Table | Method |
|---|---|---|---|
| CPP student export CSV (46 cols) | Identity, contact, GPA, parents, address | students spine | CSV import (working) |
| CPP exam/test export CSV | SAT/ACT scores, dates, subscores | test_results | CSV import (Phase 6) |
| CPP suggested college list | Colleges advisor added | application_records | Playwright scraper |
| CPP student college list | Colleges student moved to their list | application_records | Playwright scraper |
| CPP removed colleges popup | College, who removed, timestamp | application_records | Playwright scraper |
| CPP notes | Advisor-to-student sent emails | communications | Playwright scraper (later) |

### Assumptions Made

| Assumption | Impact if Wrong | When to Verify |
|---|---|---|
| CPP terms of service permit automated access to own account data | May need vendor permission or alternative | Before building Playwright scraper |
| CPP URL pattern is stable (students/view/1/{id}) | Stored URLs break if CPP changes routing | Monitor when CPP updates |
| College list renders consistently across all students | Scraper may need per-student adjustments | When building scraper |
| Sankey data fully captured by three college list states | May need additional data points | When building Sankey |

---

## Session 4 — May 3, 2026

_Apple Notes Import, Markdown Rendering, Advisor Expansion_

### What Was Built

- Apple Notes zip import pipeline — fully working with deduplication, macOS ._ metadata filtering, and 150MB file support
- Fixed FormData parsing, 10MB body size limit, and wrong URL bug (/import vs /import-notes)
- Renamed /import → /import-students for naming consistency
- Added Tools section to main dashboard with links to both importers
- Switched TipTap editor to output markdown instead of HTML
- Added react-markdown rendering for notes on student detail pages
- Expanded lead_advisor valid values: Chris, Gav, Mark, Laura, Esther (migration applied locally and to production)

### Decisions Made

- Standardize on markdown as the single note format going forward
- Import pages follow /import-[type] naming convention
- macOS ._ and __MACOSX zip entries silently ignored — not counted as errors
- proxyClientMaxBodySize set to 150MB in next.config.ts to support large zip uploads

### Assumptions

- Supabase free tier rate limit on auth emails will be resolved by upgrading or configuring custom SMTP

---

## Session 2 — May 2, 2026

_Weekly Review Dashboard, Notes Table, Local Environment_

### What Was Built

- Local Supabase initialized via Docker — full offline development capability
- Migration 002: student_key field added to students table
- Migration 003: RLS policies added to students table
- Migration 004: student_key auto-generation trigger
- Migration 005: notes table created (first tall table)
- Migration 006: needs_attention field added to students table
- 4 anonymized test students added with correct student_keys
- All three weekly review queries written and tested
- Weekly Review dashboard UI built (Next.js + Tailwind)
- Student detail page built with notes history
- All migrations pushed to production Supabase
- All code committed to GitHub

### Architecture Decisions Made

| Decision | Rationale |
|---|---|
| student_attributes renamed from note_extracts | Named for what the data is, not how it arrived. Holds all structured knowledge about a student from any source. |
| last_cpp_activity field planned for students | CPP "last note" means any activity — meeting, email, advisor note. Naming reflects this accurately. |
| Curriculum importing as founding architecture | BCC's own curriculum is imported via the same mechanism as any other IEC. No hardcoded curriculum ever. |

---

## Session 1 — May 1, 2026

_Foundation Build — Environment Setup, Students Spine, Document Set_

### What Was Built

- Complete development environment from scratch (macOS 26, CLT, Homebrew, Git, Node, Supabase CLI, Docker Desktop, Cursor)
- GitHub repository initialized: github.com/chrisbellco2/bcc-dashboard (public, MIT license)
- Next.js 15 + TypeScript + Tailwind initialized and running at localhost:3000
- Supabase project created (bcc-dashboard, Project ID: dlxbdepjbvngkgxlhcdk)
- Supabase client abstraction layer created (lib/supabase/client.ts)
- Students spine migration written and pushed to production
- Full BCC document set written: Documents 01-11

### Architecture Decisions Made

| Decision | Rationale |
|---|---|
| Move from Airtable to Postgres/Supabase | Airtable limitations (rate limits, fake joins, no real migrations) were blocking progress. Junior mailing MVP failed. Postgres is the correct foundation for BCC's relational architecture. |
| Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel | Modern, well-supported, excellent AI coding assistance, provider-independent, freely deployable. |
| MVP target: Weekly Student Review | Original MVP (junior mailing) was time-sensitive and had already failed. Weekly review delivers ongoing operational value and is a natural first feature. |
| Dual-key identity pattern (id + student_key) | UUID for system integrity and AI calls. Human-readable key for daily use. Enforces privacy-by-design structurally. |
| Provider independence as founding rule | Every external service sits behind an abstraction layer. One file to swap any provider. |
| CPP is the college list master | Students access college lists via CPP. BCC Dashboard reads from CPP, never writes back. |
| Document set: 12 documents replacing 25 | Six months of Airtable-era docs (Master Architecture v3.12, Appendices A-S) replaced with 12 clean documents mapped to the new stack. |

### Environment Snapshot

| Component | Version / State |
|---|---|
| macOS | 26.4.1 |
| Node.js | v25.9.0 |
| Supabase CLI | 2.95.4 |
| Docker Desktop | 4.71.0 |
| Next.js | 16.2.4 |
| Git | 2.54.0 |

---

_BCC Dashboard — Bell College Consulting_
_Built with Claude (Sonnet 4.6) — Cursor — Next.js — Supabase — Postgres_
_MIT License — Built to be given away_
