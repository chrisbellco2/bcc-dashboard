# BCC Dashboard — Ingestion Layer Reference

Version 0.1 — May 2026  
_INCOMPLETE — Placeholder Document_

> **INCOMPLETE DOCUMENT**  
> This document is a placeholder. The architecture was fully designed in 
> Session 5 (May 4, 2026). Content will be written when the Ingestion Layer 
> is built in Phase 6+. See the Session 5 entry in Release Notes (Document 11) 
> for the complete architecture discussion and all decisions made.

---

## Document Purpose

This document is the technical reference for the BCC Dashboard Ingestion 
Layer — the system capability that pulls data from external sources and absorbs 
it into the Supabase database. It covers: the mental model, domain structure, 
CPP scraper architecture, the adapter pattern for extensibility, the One Button 
sync workflow, CSV import pipelines, and instructions for adding new source 
adapters.

---

## Part I — Ingestion Layer Overview

### 1.1 Mental Model

CONTENT TO BE WRITTEN — BCC Dash is the destination. All external tools (CPP, 
Apple Notes, Zoom, etc.) are sources. Action happens in tools. Data flows to 
BCC Dash. BCC Dash builds the whole picture.

### 1.2 Ingestion Domains

CONTENT TO BE WRITTEN — Student Domain (current). College Domain (planned). 
Each domain follows the same adapter pattern.

### 1.3 The Three Tiers

CONTENT TO BE WRITTEN — Tier 1: CSV exports parsed by Next.js import UI. 
Tier 2: Playwright scraper (Python). Tier 3: One Button sync in dashboard.

### 1.4 Advisor Calm in the Ingestion Layer

CONTENT TO BE WRITTEN — No scheduled scraping. All ingestion advisor-triggered. 
Staged preview before data lands in tall tables. Graceful degradation for 
non-local users.

---

## Part II — CPP Integration

### 2.1 The CPP Student ID Bridge

CONTENT TO BE WRITTEN — cpp_student_id and cpp_student_url on students table. 
URL pattern: bellcollege.collegeplannerpro.com/students/view/1/{id}.

### 2.2 CPP Data Inventory

CONTENT TO BE WRITTEN — Complete field mapping from CPP to BCC Dash tables.

### 2.3 CSV Import Pipelines

CONTENT TO BE WRITTEN — Student contact export (46 columns). Exam/test export. 
Upsert logic (email as key). What gets overwritten on re-import.

### 2.4 The Playwright Scraper

CONTENT TO BE WRITTEN — Python + Playwright setup. Login flow. Navigation via 
stored URL. College list extraction. Data normalization. Writing to Supabase.

### 2.5 The One Button Sync

CONTENT TO BE WRITTEN — Health check ping to localhost:8000/health. Graceful 
degradation message. Staged preview. Advisor approval before tall table writes.

### 2.6 Bulk Sync

CONTENT TO BE WRITTEN — Loop over all active students with cpp_student_id. 
Advisor-triggered, not scheduled.

### 2.7 College List History and the Sankey Diagram

CONTENT TO BE WRITTEN — Three states: Suggested (advisor added, date), Accepted 
(student moved, date), Removed (who removed, date). Enables Sankey diagram of 
each student's college journey.

---

## Part III — The Adapter Pattern

### 3.1 What an Adapter Is

CONTENT TO BE WRITTEN — A Python file in adapters/ that extracts data from one 
source and normalizes it to BCC Dash's expected shape. adapters/cpp.py is the 
reference implementation.

### 3.2 The Normalized Output Shape

CONTENT TO BE WRITTEN — Standard shape all adapters must produce. Required 
fields. Mapping to tall tables. Provenance tracking.

### 3.3 Adding a New Adapter

CONTENT TO BE WRITTEN — Step-by-step for CounselMore, Maia, or any source. 
What to copy from adapters/cpp.py. What to customize. How to test.

### 3.4 Planned Future Adapters

CONTENT TO BE WRITTEN — CounselMore stub. Maia stub. Transcript PDF parser. 
SAT/ACT score PDF parser.

---

## Part IV — Other Student Data Sources

### 4.1 Apple Notes Pipeline

CONTENT TO BE WRITTEN — Zip upload to /import-notes. Deduplication. macOS 
metadata filtering. Mapping to notes tall table.

### 4.2 Transcripts

CONTENT TO BE WRITTEN — PDF parsing. Mapping to transcript_courses tall table.

### 4.3 Test Score Reports

CONTENT TO BE WRITTEN — SAT/ACT PDF parsing. Mapping to test_results tall table.

### 4.4 Zoom AI Summaries

CONTENT TO BE WRITTEN — Email forwarding pipeline. Routing to notes tall table 
as note_type = Zoom.

---

## Part V — Multi-User and Give-Away Considerations

### 5.1 Local vs Cloud Hosting

CONTENT TO BE WRITTEN — Local Mac for Chris. Graceful degradation for others. 
Migration path to cloud VPS. Config change only — same scraper code.

### 5.2 Graceful Degradation

CONTENT TO BE WRITTEN — Health check pattern. Message box UX. Manual CSV 
fallback. No broken experiences for non-local users.

### 5.3 For IECs Deploying Their Own Instance

CONTENT TO BE WRITTEN — CPP credential configuration. Which adapters apply. 
Setup guide reference.

---

_BCC Dashboard — Bell College Consulting_  
_Built with Claude (Sonnet 4.6) — Cursor — Next.js — Supabase — Postgres_  
_MIT License — Built to be given away_