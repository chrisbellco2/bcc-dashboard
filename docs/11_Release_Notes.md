**BCC Dashboard --- Release Notes**

Living Document --- Started May 1, 2026

*Running changelog of all builds and changes*

  -----------------------------------------------------------------------
  *This document is updated after every significant build session. It
  records what was built, what decisions were made, and what assumptions
  were carried forward. It is both a technical changelog and a decision
  log.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# How to Read This Document

Entries are in reverse chronological order --- newest first. Each entry
includes:

- Date and session description

- What was built or changed

- Decisions made (and why)

- Assumptions made (flagged for later review)

- What is next

**Session 1 --- May 1, 2026**

*Foundation Build --- Environment Setup, Students Spine, Document Set*

## What Was Built

- Complete development environment from scratch (macOS 26, CLT,
  Homebrew, Git, Node, Supabase CLI, Docker Desktop, Cursor)

- GitHub repository initialized: github.com/chrisbellco2/bcc-dashboard
  (public, MIT license)

- Next.js 15 + TypeScript + Tailwind initialized and running at
  localhost:3000

- Supabase project created (bcc-dashboard, Project ID:
  dlxbdepjbvngkgxlhcdk)

- Supabase client abstraction layer created (lib/supabase/client.ts)

- Students spine migration written and pushed to production (migration:
  20260501203957_create_students_table.sql)

- Full BCC document set written: Documents 01-11 (this document)

## Architecture Decisions Made

  -----------------------------------------------------------------------
  **Decision**           **Rationale**
  ---------------------- ------------------------------------------------
  Move from Airtable to  Airtable limitations (rate limits, fake joins,
  Postgres/Supabase      no real migrations) were blocking progress.
                         Junior mailing MVP failed. Postgres is the
                         correct foundation for BCC\'s relational
                         architecture.

  Stack: Next.js +       Modern, well-supported, excellent AI coding
  TypeScript +           assistance, provider-independent, freely
  Tailwind + Supabase +  deployable.
  Vercel                 

  MVP target: Weekly     Original MVP (junior mailing) was time-sensitive
  Student Review         and had already failed. Weekly review delivers
                         ongoing operational value and is a natural first
                         feature.

  Dual-key identity      UUID for system integrity and AI calls.
  pattern (id +          Human-readable key for daily use. Enforces
  student_key)           privacy-by-design structurally.

  Provider independence  Every external service sits behind an
  as founding rule       abstraction layer. One file to swap any
                         provider.

  CPP is the college     Students access college lists via CPP. BCC
  list master            Dashboard reads from CPP, never writes back.

  Document set: 12       Six months of Airtable-era docs (Master
  documents replacing 25 Architecture v3.12, Appendices A-S) replaced
                         with 12 clean documents mapped to the new stack.

  Gav Bell removed from  Gav took a new job. System is now primarily
  system documentation   Chris\'s, with Mark being the Success Manager
                         and more. The open-source IEC community as
                         secondary audience.
  -----------------------------------------------------------------------

## Assumptions Made

  ---------------------------------------------------------------------------
  **Assumption**            **Impact if Wrong**   **When to Verify**
  ------------------------- --------------------- ---------------------------
  student_key format:       Collision possible if When migration 002 is
  GradYear_FirstLast_XXXX   two students share    written
  (first 4 of UUID)         name and year         
                            (unlikely). Format    
                            may need adjustment.  

  14-day Ball Check         Too short or too long After first real use of
  threshold is appropriate  for Chris\'s actual   weekly review
                            rhythm                

  CPP export format is      Import pipeline may   When import pipeline is
  parseable                 need different        built
                            approach              

  Anthropic API is the      May need different    After initial extraction
  right AI provider for all providers for         testing
  use cases                 different tasks       

  Gmail API is sufficient   May need dedicated    When communication drafting
  for email sending         email service for     is built
                            deliverability        

  supabase/migrations/ is   CLI may use different When supabase start is set
  the correct local path    directory depending   up locally
                            on version            
  ---------------------------------------------------------------------------

## What Is Next

- Session 2: Set up local Supabase (Docker), run migration 002
  (student_key), write RLS policies, add test students

- Session 2: Write Notes table migration

- Session 2: Build weekly review queries

- Session 2: Start advisor dashboard UI

- Soon: Test CPP AI feature for structured export capability

- Soon: Explore Apple Notes markdown export for note ingestion

## Environment Snapshot

  -----------------------------------------------------------------------
  **Component**         **Version / State**
  --------------------- -------------------------------------------------
  macOS                 26.4.1

  Node.js               v25.9.0

  Supabase CLI          2.95.4

  Docker Desktop        4.71.0

  Next.js               16.2.4

  Git                   2.54.0

  GitHub repo           2 commits (initial + Next.js init + Students
                        migration)

  Supabase project      bcc-dashboard --- Healthy --- Production ---
                        dlxbdepjbvngkgxlhcdk

  Local Supabase        Not yet initialized (supabase start not yet run)

  Production URL        Not yet deployed to Vercel
  -----------------------------------------------------------------------

\-\-- Future sessions appended below this line \-\--

**Session 2 --- May 2, 2026**

*Weekly Review Dashboard, Notes Table, Local Environment*

**What Was Built**

- Local Supabase initialized via Docker --- full offline development
  capability

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

**Architecture Decisions Made**

  -----------------------------------------------------------------------
  **Decision**           **Rationale**
  ---------------------- ------------------------------------------------
  note_extracts renamed  Named for what the data is, not how it arrived.
  to student_attributes  Holds all structured knowledge about a student
                         from any source.

  last_cpp_activity      CPP \"last note\" means any activity ---
  field planned for      meeting, email, advisor note. Naming reflects
  students               this accurately.

  Curriculum importing   BCC\'s own curriculum is imported via the same
  as founding            mechanism as any other IEC. No hardcoded
  architecture           curriculum ever.

  Curriculum sharing     Curriculum packages are versioned, structured
  vision established     exports of curriculum tables. Community library
                         of advising frameworks is the long-term goal.
  -----------------------------------------------------------------------

**What Is Next (Session 3)**

- Doc update pass --- ball_owner, current_status, last_cpp_activity
  field definitions

- Deploy to Vercel

- Migrations: ball_owner, current_status, last_cpp_activity on students
  table

- Dashboard enhancements --- add new columns to weekly review

- Notes entry interface

- Basic CSV import from CPP export

**RELEASE NOTES --- Session 4 entry (append after Session 1)**

**Session 4 --- May 3, 2026** *Apple Notes Import, Markdown Rendering,
Advisor Expansion*

**What Was Built**

- Apple Notes zip import pipeline --- fully working with deduplication,
  macOS .\_ metadata filtering, and 150MB file support

- Fixed FormData parsing, 10MB body size limit, and wrong URL bug
  (/import vs /import-notes)

- Renamed /import → /import-students for naming consistency

- Added Tools section to main dashboard with links to both importers

- Switched TipTap editor to output markdown instead of HTML

- Added react-markdown rendering for notes on student detail pages

- Expanded lead_advisor valid values: Chris, Gav, Mark, Laura, Esther
  (migration applied locally and to production)

**Decisions Made**

- Standardize on markdown as the single note format going forward

- Import pages follow /import-\[type\] naming convention

- macOS .\_ and \_\_MACOSX zip entries silently ignored --- not counted
  as errors

- proxyClientMaxBodySize set to 150MB in next.config.ts to support large
  zip uploads

**Assumptions**

- Supabase free tier rate limit on auth emails will be resolved by
  upgrading or configuring custom SMTP

**What Is Next**

- Ball ownership and \"next ask\" workflow per student

- Student detail page editing

- Advisor account invites (pending Supabase rate limit)

- AI extraction pipeline (Phase 4)

**Environment Snapshot**

  ----------------------------------------------
  **Component**   **Version / State**
  --------------- ------------------------------
  GitHub repo     Multiple commits, main branch
                  current

  Supabase        bcc-dashboard --- Healthy ---
  project         Production

  Local Supabase  Running via Docker

  Production URL  Not yet deployed to Vercel

  Notes in        336 (all junior class, fully
  database        imported)
  ----------------------------------------------

---

## Session 5 — May 4, 2026

_Ingestion Layer Exploration — CPP Tour, Architecture Design_

> No code written this session. Pure architecture exploration. The 4:15am 
> wake-up that produced the Ingestion Layer vision.

### What Was Explored and Decided

- Full tour of College Planner Pro (CPP) — students list, student detail page, 
  meetings, notes, college list, removed colleges popup, all report exports
- Ingestion Layer mental model established: BCC Dash is destination, all tools 
  are sources
- CPP data inventory completed — exportable vs scraping required
- Three-tier ingestion architecture designed
- Python + Playwright selected as scraper stack
- Graceful degradation pattern designed for Mark and non-local users
- Adapter pattern established for CounselMore, Maia, and future sources
- Sankey diagram goal confirmed — college list history data supports it
- Document 12 (Ingestion Layer Reference) created as placeholder
- Document 00 updated

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
| CPP notes low priority for Chris | Chris uses Apple Notes. CPP notes matter for other IECs — build later for give-away. |
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

### Schema Changes Identified (Not Yet Built)

- `cpp_student_id` (integer, nullable) — CPP student ID from URL, e.g. 1468
- `cpp_student_url` (text, nullable) — full URL e.g. bellcollege.collegeplannerpro.com/students/view/1/1468
- Both added in Session 6 migration

### Ingestion Layer Build Order

| Phase | What | Tech | Effort |
|---|---|---|---|
| Session 6 (now) | Add cpp_student_id + cpp_student_url fields | SQL migration | 10 minutes |
| Ingestion v1 | CSV import UI for exam/test scores | Next.js | 1 session |
| Ingestion v2 | Python + Playwright scraper for college list | Python | 2-3 sessions |
| Ingestion v3 | One Button sync UI in dashboard | Next.js + Python | 1 session |
| Ingestion v4 | Bulk sync — all students at once | Python extension | 1 session |
| Later | CPP notes scraping for give-away IECs | Python extension | 1 session |

### Assumptions Made

| Assumption | Impact if Wrong | When to Verify |
|---|---|---|
| CPP terms of service permit automated access to own account data | May need vendor permission or alternative | Before building Playwright scraper |
| CPP URL pattern is stable (students/view/1/{id}) | Stored URLs break if CPP changes routing | Monitor when CPP updates |
| College list renders consistently across all students | Scraper may need per-student adjustments | When building scraper |
| Sankey data fully captured by three college list states | May need additional data points | When building Sankey |

### What Is Next (Session 6)

- Authentication — login page, 5 advisor accounts, all routes protected
- Deploy to Vercel — real production URL
- Inline editing — ball_owner and current_status from dashboard
- Student detail page editing — phase, mode, basic fields
- Migration: cpp_student_id and cpp_student_url on students table

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
