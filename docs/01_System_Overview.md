**BCC Dashboard --- System Overview**

v1.0 --- May 2026

# What This System Is

The BCC Dashboard is a Guidance & Advising Management System (AMS) for
Bell College Consulting. It is the operational and advising backbone for
a professional independent educational consulting practice.

It is not a CRM. Not a task manager. Not a learning management system.

It is a knowledge engine --- designed around how real college advising
works. Iterative conversations. Personal growth. Evolving interests.
Shifting timelines. Individualized strategy. The invisible expertise
that great advisors carry in their heads, made visible, organized, and
sustainable.

The system supports Chris Bell\'s YOU → FIT → APP advising model while
remaining architecturally neutral --- adaptable to any advising
framework without structural changes.

# Why It Exists

Great advising is already happening. The system exists to support it ---
not replace it.

Its purpose is to automate everything that is not advising:

- Reminders and follow-ups

- Deadline tracking

- Organizational overhead

- Progress monitoring

- Note extraction and structuring

- Predictable sequence steps

- Advisor-facing documentation

- Student and parent communications

This preserves advisor attention for the work that matters:
interpretation, mentoring, judgment, strategy, and care.

# Who It\'s For

**Primary users:**

- Chris Bell --- lead advisor, system owner

- Mark Gammon --- student success manager, advisor, co-user

**Secondary users (later phases):**

- Students --- simplified task and deadline portal

- Parents --- milestone and communication portal

**Future users:**

- Other independent educational consultants --- the system will be given
  away free under MIT license

# The Advising Framework

The system is built around four organizing concepts:

## Phases

Time-based stages of the advising arc:

- PRE --- onboarding and early relationship building

- YOU --- identity exploration, assessments, self-discovery

- FIT --- college research, list building, alignment

- APP --- applications, essays, deadlines, decisions

- POST --- commitment, transition, closure

Phases are stored as neutral keys in a Phase Definitions table --- not
hard-coded. YOU/FIT/APP are BCC\'s internal labels, not architectural
constraints. Any advising vocabulary can be substituted without schema
changes.

## Modes

The advisor\'s stance and cadence:

- Structured --- task-heavy, direction-rich, predictable rhythm

- Exploratory --- open-ended, discovery-oriented, lighter touch

- Reactive --- deadline-driven, high urgency, event-triggered

- Reflective --- post-decision, transition support, low frequency

## Pathways

Parallel domains of advising logic:

- Process --- the core YOU → FIT → APP sequence

- Calendar --- deadlines, dates, and external anchors

- Academic --- courses, GPA, rigor, testing

- Talent --- athletics, arts, research, leadership

- Financial --- affordability, aid planning, budget

- Developmental --- identity, maturity, well-being

- Optional: Neurodiversity, Athletics, Arts, First-Generation, and
  others

## Temporal Anchors

Student-relative dates that drive all timing. Rather than fixed calendar
dates, the system uses anchors like \"June 1 before senior year\" or
\"three months before earliest deadline.\" Every rule, task, and
reminder resolves relative to each student\'s individual timeline.

# Architectural Principles

These principles are non-negotiable. Every technical decision is
evaluated against them.

## AI-First, Human-Verified

AI extracts, drafts, proposes, and analyzes. Humans approve, modify, or
reject. Nothing reaches a student or family without advisor review. No
exceptions.

## Privacy by Design

Student data is governed from day one. No PII in AI prompts beyond what
is strictly necessary. No student data in version control. Clear
boundaries between advisor-only and family-facing data. Data is deleted
per retention policy, not accumulated indefinitely.

## Advisor Calm

The system cannot surprise the advisor. No rules fire silently. No
messages send automatically. No student receives anything without
explicit approval. Every automated action is logged, auditable, and
reversible.

## Provenance Everywhere

Every action, extraction, rule execution, and communication tracks its
source, timestamp, rule ID, and phase context. The system maintains a
complete, append-only Events Log. Nothing is anonymous.

## Portable by Design

The architecture is platform-independent. Data is stored in standard
relational format. Schema is version-controlled via migrations.
Everything exports cleanly. The system can migrate to any Postgres host
without data loss.

## Provider Independence

Every external service sits behind an abstraction layer. The application
never depends directly on a specific vendor. AI provider, email
provider, database host, authentication provider, and deployment
platform are all independently swappable. Changing providers means
rewriting one small layer --- nothing else.

## Simple by Default, Powerful When Needed

Everyday workflows stay clean and obvious. Complexity lives in the data
model, not in the interface. Advisors see what they need. Everything
else is handled by the system.

## Institutional Memory Without Identity

The system preserves professional insight across student cohorts while
deleting identifiable student records per retention policy. Alumni Case
Profiles store de-identified learnings after engagement ends.

# Data Architecture

The system uses a Spine + Tall Table design --- a clean relational
pattern that maps directly to how advising actually works.

## Spines

Stable master tables defining the entities in the system. They change
slowly and serve as anchors for all activity:

- Students

- Colleges

- High Schools

- Assessments

- Pathways

- Phase Definitions

- Curriculum Programs

- Curriculum Items

- Opportunities (Summer Programs)

- Tests

- GPA Schemes

- Import Batches

## Tall Tables

Growing event tables storing everything that happens over time:

- Notes and Meetings

- Assigned Tasks

- Communications

- Assessment Results

- Extracts (Interview Extracts)

- Transcript Courses

- Test Results

- Application Records

- Decision Outcomes

- Advising Rules

- Advising Items (approval queue)

- Events Log

- Governance Log

## The Logic Layer

Sits between data and action:

- Pathways define domain logic (the brains)

- Rails control timing --- Process (sequence) and Calendar (date-based)

- Effects produce tasks, communications, and milestones

- All effects pass through the advisor approval queue before execution

# Student Identity: The Dual-Key Pattern

Every student record carries two identifiers that serve different
purposes:

  ----------------------------------------------------------------------------------
  **Key**       **Format**                **Used For**         **Example**
  ------------- ------------------------- -------------------- ---------------------
  id            UUID (random)             All foreign keys, AI a8f3c2d1-9b4e-\...
                                          calls, system        
                                          references           

  student_key   GradYear_FirstLast_XXXX   Display, debugging,  2027_ChrisBell_a8f3
                                          daily advisor use    
  ----------------------------------------------------------------------------------

The UUID carries no identifying information and is used everywhere data
integrity matters. The student_key is human-readable and used for
display and debugging. The first four characters of the UUID are
appended to prevent collisions.

**The privacy rule:**

- Send to AI: id only (UUID)

- Display in UI: student_key or full_name

- Foreign keys: always id

- Export/anonymize: id only, strip student_key

- GitHub/logs: never either one

# The AI Pipeline

The system uses AI in five roles --- all auditable, all human-verified:

**Extractor**

Converts raw meeting notes and assessment responses into structured data
via the RawPayload → StructuredOutput → Extract pipeline.

**Writer**

Drafts personalized communications, progress summaries, and student
reports using structured data from the database.

**Analyst**

Identifies risks, flags inactivity, surfaces patterns across student
cohorts.

**Recommender**

Proposes next steps, pathway activations, and college matches (later
phases).

**Communicator**

Generates mail-merge style emails that feel individually written, not
templated.

The AI provider sits behind an abstraction layer. Claude is the current
provider. Switching to another model requires changing one file.

# Current Data Sources

  ------------------------------------------------------------------------
  **Source**      **What It Contains**   **Integration Approach**
  --------------- ---------------------- ---------------------------------
  College Planner CRM, meetings, emails, Export/AI-assisted import. CPP
  Pro (CPP)       college list           owns the college list --- BCC
                                         Dashboard reads it, never
                                         overwrites it

  Apple Notes     Freeform advisor       Markdown export → structured
                  notes, Zoom AI         import
                  summaries              

  Google Drive    Student folders,       Manual or API-assisted import
                  Interview spreadsheets 

  Gmail           Outbound               Gmail API (later phase)
                  communications         

  Zoom AI         Meeting summaries      Email forwarding pipeline
  ------------------------------------------------------------------------

# The Tech Stack

  -------------------------------------------------------------------------
  **Layer**        **Technology**        **Why**
  ---------------- --------------------- ----------------------------------
  Database         PostgreSQL via        True relational database, matches
                   Supabase              Spine + Tall Table perfectly

  Backend/API      Supabase              No separate server to maintain
                   auto-generated        

  Authentication   Supabase Auth         Built-in, RLS-enforced

  Frontend         Next.js 15 +          Modern, portable, AI-assisted
                   TypeScript            development

  Styling          Tailwind CSS          Fast, professional, consistent

  AI               Anthropic Claude API  Behind abstraction layer,
                                         swappable

  Version Control  Git + GitHub          All schema and code versioned

  Deployment       Vercel                Automatic deploys from GitHub

  IDE              Cursor                AI-native development environment
  -------------------------------------------------------------------------

Schema management: All database changes are made via numbered migration
files. Every change is versioned, reversible, and recorded in Git
history. No clicking around in a UI to change schema.

**Development environments:**

- Local: Next.js dev server + local Supabase via Docker --- full offline
  capability

- Production: Vercel + Supabase Cloud

# What This System Is Not

- Not a replacement for advisor judgment

- Not an automated advising system

- Not a learning management system

- Not a billing or time-tracking system

- Not a college search engine

- Not a replacement for College Planner Pro (CPP remains the
  student-facing CRM)

# The Giving-It-Away Goal

This system will be released free to the independent educational
consulting community under the MIT open source license.

The architecture is designed with this in mind:

- No BCC-specific logic hard-coded into the schema

- Phase definitions, curriculum programs, and pathways are all
  configurable

- Developer documentation written for someone picking this up cold

- One-command local setup

- Clean migrations that build the full schema from scratch

The goal is that any IEC counselor with basic technical help can deploy
their own instance. Chris will not provide ongoing support --- the
documentation and architecture must stand on their own.

# **Curriculum Sharing Vision**

The long-term vision for the give-away is not just a free tool --- it\'s
a community of practice.

Because curriculum is stored as data (phase definitions, curriculum
programs, curriculum items, pathways) and not hardcoded into the
application, it can be exported and imported as a structured package.

This enables a curriculum marketplace:

- An IEC exports their advising framework as a shareable curriculum
  package

- Another IEC imports it into their own instance with one command

- Specialists build and share domain-specific pathways ---
  Neurodiversity, Arts, First-Generation, Transfer, Athletics

- The community builds a library of reusable advising frameworks over
  time

A curriculum package is a versioned, structured export of the curriculum
tables. A standard format and import validator ensure packages apply
cleanly to any instance.

This is Post-MVP. But the curriculum tables are being designed with
export/import in mind from day one so this capability can be added
without schema changes.

The goal: any IEC can benefit from the collective intelligence of the
community, while maintaining full control over their own advising
approach.

BCC\'s own curriculum (YOU → FIT → APP) is itself imported via this
mechanism --- there is no hardcoded BCC curriculum in the application.
This ensures the import system is battle-tested and that the give-away
version is architecturally identical to the version Chris runs.

# Document Set

This system is documented across 12 files:

**Core:**

- System Overview (this document)

- MVP Build Plan

- Data Dictionary

- Architecture Reference

- Developer Guide

**Reference:**

- Advising Pathways Reference

- ADR Reference

- Privacy and Governance Guide

- Automation and AI Reference

**Operational:**

- Weekly Review Playbook

- Release Notes / Changelog

The original Airtable-era documentation (Master Architecture v3.12,
Design & Philosophy Guide v1.7, Appendices A-S) is retained for
historical reference but is no longer the active specification.

# Current Status

As of May 1, 2026:

- Development environment complete

- GitHub repository initialized (public, MIT license)

- Supabase project created

- Students spine migration written and deployed (includes dual-key
  pattern)

- MVP target: Weekly Student Review

GitHub: github.com/chrisbellco2/bcc-dashboard

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
