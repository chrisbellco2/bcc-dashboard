**BCC Dashboard --- Architecture Reference**

Version 1.0 --- May 2026

*Stack: Next.js + TypeScript + Tailwind + Supabase + Postgres*

  -----------------------------------------------------------------------
  *Who this document is for: Chris Bell (system owner and primary
  developer) and any future developer picking up this codebase. It
  assumes comfort with basic web concepts but explains BCC-specific
  decisions in detail. When in doubt, this document explains the why, not
  just the what.*

  -----------------------------------------------------------------------

**Part I --- Why We\'re Here**

**1.1 What We\'re Building**

The BCC Dashboard is a Guidance & Advising Management System --- a
professional tool that manages the full college advising lifecycle for
Bell College Consulting. It replaces a fragmented collection of tools
(Airtable, Apple Notes, Google Drive, CPP, Gmail) with a single,
coherent system built on real infrastructure.

It is not a prototype. It is not a no-code tool. It is a real web
application backed by a real relational database, designed to be given
away to the independent educational consulting community under the MIT
license.

**1.2 Why We Left Airtable**

Six months of architecture work was done against Airtable. The thinking
was right. The tool was wrong. Here is an honest accounting of why:

  --------------------------------------------------------------------------
  **Limitation**   **The Real Problem**   **How Postgres Solves It**
  ---------------- ---------------------- ----------------------------------
  Rate limits      Automations hitting    No rate limits. Direct database
                   API caps during busy   queries run at full speed.
                   periods. Real advising 
                   workflows slowed or    
                   stopped.               

  Fake joins       Linked records look    Real foreign keys. Referential
                   relational but         integrity enforced by the database
                   aren\'t. No real       itself. Orphan records impossible.
                   foreign key            
                   constraints. Data      
                   integrity not enforced 
                   at the database level. 

  Formula field    Complex temporal logic All computation happens in SQL or
  limits           required chains of     application code. No formula field
                   formula fields that    tax.
                   slowed UI rendering    
                   and were fragile to    
                   change.                

  Row limits and   Airtable pricing       Postgres has no meaningful row
  pricing          scales with records    limits at BCC\'s scale. Supabase
                   and collaborators. A   free tier handles the full
                   practice growing to    practice.
                   100 students with tall 
                   tables would hit       
                   limits quickly.        

  Automation       Make.com scenarios     All logic lives in application
  brittleness      broke when Airtable    code under version control.
                   changed field names or Changes are tracked, tested, and
                   API behavior.          reversible.
                   Maintenance overhead   
                   grew.                  

  No real          Schema changes were    Every schema change is a versioned
  migrations       clicks in a UI with no SQL file committed to Git. Full
                   history, no rollback,  history forever.
                   no documentation.      

  Portability trap Data and logic were    Postgres is the most portable
                   increasingly           database in existence. The schema
                   Airtable-specific.     exports cleanly to any host.
                   Migration would have   
                   been painful.          
  --------------------------------------------------------------------------

  -----------------------------------------------------------------------
  *The architecture designed for Airtable was correct. The Spine + Tall
  Table model, the Phase/Mode/Pathway framework, the AI pipeline design,
  the privacy principles --- all of it translated directly to Postgres
  without modification. We weren\'t rebuilding. We were moving good
  thinking to a better foundation.*

  -----------------------------------------------------------------------

**1.3 The Migration Decision**

The decision to move was made on May 1, 2026, at the start of the first
development session. The reasoning was simple:

- The MVP had already failed once --- the junior mailing pipeline could
  not be delivered reliably on Airtable

- The architecture was already designed to be portable (Appendix R of
  the original docs explicitly anticipated this migration)

- Starting fresh on the right foundation costs less than retrofitting
  later

- Claude as a coding collaborator makes a real stack tractable for a
  solo developer

The original documentation set (Master Architecture v3.12, Design &
Philosophy Guide v1.7, Appendices A-S) is retained as a historical
record. This document set supersedes it for all active development
decisions.

**Part II --- The Stack**

**2.1 Stack Overview**

  -----------------------------------------------------------------------------
  **Layer**     **Technology**     **Version**   **Role**
  ------------- ------------------ ------------- ------------------------------
  Database      PostgreSQL         15+           All data storage. The system
                                                 of record.

  Database Host Supabase           Current       Hosts Postgres. Provides auth,
                                                 auto-API, storage, dashboard.

  Backend/API   Supabase           ---           Database access and AI calls.
                auto-generated +                 No separate server.
                Next.js API routes               

  Frontend      Next.js            15            Web application framework.
                                                 Pages, routing, server
                                                 components.

  Language      TypeScript         5+            Type-safe JavaScript. Catches
                                                 data shape errors at compile
                                                 time.

  Styling       Tailwind CSS       3+            Utility-first CSS. No separate
                                                 stylesheet files.

  AI Provider   Anthropic Claude   Current       Extraction, drafting,
                API                              analysis. Behind abstraction
                                                 layer.

  Auth          Supabase Auth      Current       Login, sessions, JWT tokens,
                                                 RLS enforcement.

  Version       Git + GitHub       ---           All code and schema versioned.
  Control                                        Public MIT-licensed repo.

  Deployment    Vercel             ---           Automatic deploys from GitHub.
                                                 Zero-config.

  IDE           Cursor             Current       AI-native code editor. Claude
                                                 assistance in-editor.

  Local Dev     Docker + Supabase  Current       Full local stack for offline
                CLI                              development.
  -----------------------------------------------------------------------------

**2.2 Why This Stack**

The stack was chosen against three criteria:

**1. Solo-developer tractable with AI assistance**

The most common modern stack in Claude\'s training data. AI assistance
is excellent across every layer. No obscure tools that AI struggles
with.

**2. Provider independent at every layer**

Every external service sits behind an abstraction layer. Supabase can be
replaced with any Postgres host. Claude can be replaced with any AI
provider. Vercel can be replaced with any Node host. No vendor lock-in.

**3. Giveable**

Any developer with Node.js installed can clone the repo and run the
system locally in under 10 minutes. No proprietary tooling. No paid
services required to develop. MIT licensed.

**2.3 What We Deliberately Did Not Choose**

  -----------------------------------------------------------------------
  **Alternative**    **Why Not Chosen**
  ------------------ ----------------------------------------------------
  Firebase /         NoSQL document database. BCC\'s architecture is
  Firestore          deeply relational (Spine + Tall Table). Fighting a
                     document DB would undermine the entire data model.

  Django / Rails /   Full-stack frameworks with separate backend servers.
  Laravel            More moving parts to maintain. Excellent tools but
                     overkill for a solo developer with AI assistance.

  Retool / Bubble /  Low-code tools. Same category of trap as Airtable
  AppSmith           --- fast to start, constrained at scale, proprietary
                     lock-in, not giveable.

  Prisma ORM         Adds an abstraction layer over SQL that obscures
                     what queries are actually running. For a
                     data-intensive system, direct SQL via Supabase
                     client is clearer and more controllable.

  Separate backend   Supabase\'s auto-generated API and RLS handle 90% of
  (Express /         data access needs. Next.js API routes handle the
  FastAPI)           rest. A separate backend server adds deployment
                     complexity with no benefit at this scale.
  -----------------------------------------------------------------------

**Part III --- Data Architecture**

**3.1 The Spine + Tall Table Pattern**

The BCC data model uses a pattern called Spine + Tall Table. This
pattern reflects how advising actually works and maps cleanly to
relational database design.

**Spines are stable master tables.**

They define the entities in the system --- the things that exist.
Students, Colleges, Assessments, Pathways. Spines change slowly. A
student record is created when a student engages and archived when they
leave. A college record is created once and updated rarely.

**Tall tables are growing event tables.**

They store everything that happens over time --- the instances, actions,
and observations. Notes, Tasks, Extracts, Communications, Events. Tall
tables grow continuously as advising happens. A single student might
generate hundreds of tall table rows over a two-year engagement.

  -----------------------------------------------------------------------
  *The name \'tall table\' comes from the shape: narrow (few columns) but
  long (many rows). A notes table for 50 students might have 2,000 rows.
  An extracts table might have 5,000. This is normal and exactly what
  Postgres is designed for.*

  -----------------------------------------------------------------------

  -------------------------------------------------------------------------
  **Layer**    **Type**         **Examples**           **Growth Pattern**
  ------------ ---------------- ---------------------- --------------------
  Spines       Stable master    students, colleges,    Slow --- created
               tables           assessments            once, rarely updated

  Tall Tables  Event/instance   notes, tasks,          Fast --- new rows
               tables           extracts,              every advising
                                communications         session

  Join Tables  Many-to-many     student_pathways       Moderate --- one row
               links                                   per activation

  Logic Tables Rule storage     advising_rules,        Moderate --- grows
                                advising_items         as rules are added

  Governance   System audit     events_log,            Fast ---
               trail            governance_log         append-only, never
                                                       deleted
  -------------------------------------------------------------------------

**3.2 The Four Layers**

The full system rests on four layers that build on each other:

**Layer 1 --- Foundations (Spines)**

The stable entities. Students, Colleges, Assessments, Pathways,
Opportunities, Tests, GPA Schemes. These define who and what exists in
the BCC universe. Nothing in the system works without anchoring to a
spine record.

**Layer 2 --- Activity (Tall Tables)**

The instances and actions. Notes, Tasks, Extracts, Communications,
Application Records, Decisions, Events Log. These capture everything
that happens over time. Every row in a tall table links to a spine
record via foreign key.

**Layer 3 --- Logic (Brains → Rails → Effects)**

The advising intelligence layer. Pathways define domain logic (the
brains). Rails control timing --- Process-based (sequence) and
Calendar-based (dates). Effects produce tasks, communications, and
milestones. In MVP this layer is partially dormant --- the data model
supports it but automation is not yet active.

**Layer 4 --- Interfaces**

What humans see and interact with. The Advisor Dashboard (Next.js web
app). The Student/Parent Portal (Phase 2). Both read from and write to
the database through the application layer.

**3.3 The Dual-Key Identity Pattern**

Every student record carries two identifiers that serve different
purposes. This is a founding architectural decision, not an
implementation detail.

  -----------------------------------------------------------------------------------------
  **Key**       **Type**   **Format**                     **Purpose**
  ------------- ---------- ------------------------------ ---------------------------------
  id            UUID       a8f3c2d1-9b4e-4f2a-b8c3-\...   System identifier. All foreign
                                                          keys, API calls, AI interactions.
                                                          Carries no identifying
                                                          information.

  student_key   Text       2027_ChrisBell_a8f3            Human-readable identifier.
                                                          Display, debugging, daily advisor
                                                          use. Never used as a foreign key.
  -----------------------------------------------------------------------------------------

**Why two keys?**

The UUID carries no identifying information. When the system sends data
to the Claude API for extraction or drafting, it sends the UUID only.
The AI processes the content without ever seeing a student name. This
enforces privacy-by-design at the data layer --- not as a policy but as
a structural constraint.

The student_key is human-readable for the advisor\'s benefit. It makes
debugging, filtering, and daily use natural. The four-character UUID
suffix prevents collisions even if two students share a name and
graduation year.

**The privacy rule --- enforced in every layer:**

- Send to AI: id only (UUID)

- Display in UI: student_key or full_name

- All foreign keys in tall tables: always id

- Export and anonymization: id only, strip student_key

- GitHub, logs, and version control: never either one

**3.4 Schema Management via Migrations**

Every database change is made through a migration file --- a numbered
SQL file that describes exactly what changed and why. Migrations are
committed to Git alongside code. The schema\'s full history is always
available.

**Migration naming convention:**

YYYYMMDDHHMMSS_description_of_change.sql

Examples:

20260501203957_create_students_table.sql

20260502000000_add_student_key_to_students.sql

20260503000000_create_notes_table.sql

**The migration workflow:**

- Write migration file locally

- Test against local Supabase (Docker)

- Verify behavior is correct

- Run: supabase db push

- Migration applies to production database

- Commit migration file to GitHub

  -----------------------------------------------------------------------
  *Migrations are append-only. You never edit a migration that has
  already been pushed. If you need to change something, you write a new
  migration that makes the correction. This ensures every environment
  (local, production, any future fork) can build the exact same schema
  from scratch by running all migrations in order.*

  -----------------------------------------------------------------------

**3.5 Row Level Security (RLS)**

Row Level Security is Postgres\'s built-in access control system. When
RLS is enabled on a table, every query --- no matter who makes it --- is
filtered by policies that define what each user can see.

BCC uses RLS to enforce the visibility model from the architecture:

- Advisors (Chris) can read and write all student records

- Future: students can read only their own record

- Future: parents can read only their child\'s record

- No exceptions, no bypasses --- enforced at the database level

**Why this matters:**

RLS means that even if there\'s a bug in the application code --- a
query that accidentally asks for all students --- the database returns
only what the logged-in user is permitted to see. Security is not
dependent on application code being correct.

\-- Example RLS policy (simplified)

CREATE POLICY advisor_full_access ON students

FOR ALL

TO authenticated

USING (auth.jwt() -\>\> \'role\' = \'advisor\');

**Part IV --- Application Architecture**

**4.1 Project Structure**

The codebase follows Next.js App Router conventions with BCC-specific
organization:

bcc-dashboard/

├── app/ \# Next.js App Router

│ ├── page.tsx \# Home / dashboard

│ ├── students/ \# Student routes

│ │ ├── page.tsx \# Student list

│ │ └── \[id\]/ \# Student detail

│ │ └── page.tsx

│ └── api/ \# API routes (server-side only)

│ ├── extract/ \# AI extraction endpoint

│ └── draft/ \# Email draft endpoint

├── lib/ \# Shared utilities

│ ├── supabase/

│ │ ├── client.ts \# Browser Supabase client

│ │ └── server.ts \# Server Supabase client (future)

│ └── ai/ \# AI abstraction layer

│ ├── extract.ts \# Note extraction

│ └── draft.ts \# Email drafting

├── components/ \# Reusable UI components

├── supabase/

│ └── migrations/ \# All SQL migration files

├── .env.local \# Local environment variables (never in Git)

└── package.json

**4.2 The Supabase Client Layer**

The Supabase client is the bridge between the application and the
database. It is initialized once and exported from a single file --- the
abstraction layer that makes the database provider swappable.

// lib/supabase/client.ts

import { createClient } from \'@supabase/supabase-js\'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

Every database interaction in the application imports from this file. If
the database provider changes, this is the only file that changes.
Nothing else in the codebase knows or cares what database it is talking
to.

**4.3 The AI Abstraction Layer**

AI calls follow the same abstraction principle. The application never
calls the Anthropic API directly. It calls functions in lib/ai/ --- and
those functions call the API. Swapping AI providers means rewriting
lib/ai/, nothing else.

// lib/ai/extract.ts --- simplified structure

export async function extractFromNote(noteContent: string, studentId:
string) {

// studentId is UUID only --- never student_key or name

const response = await anthropic.messages.create({

model: \'claude-sonnet-4-20250514\',

messages: \[{ role: \'user\', content:
buildExtractionPrompt(noteContent) }\]

})

return parseExtractionResponse(response)

}

+-----------------------------------------------------------------------+
| **Provider Independence Rule**                                        |
|                                                                       |
| The application never imports from \'@anthropic-ai/sdk\' directly in  |
| page or component files. All AI calls go through lib/ai/. This is     |
| enforced by convention and should be enforced by ESLint rules in a    |
| future phase.                                                         |
+-----------------------------------------------------------------------+

**4.4 API Routes (Server-Side AI Calls)**

AI API keys must never be exposed to the browser. All calls to the
Anthropic API are made from Next.js API routes --- server-side code that
runs on Vercel, not in the user\'s browser.

// app/api/extract/route.ts (simplified)

export async function POST(request: Request) {

const { noteId, studentId } = await request.json()

// Fetch note content from database (server-side)

const { data: note } = await supabaseServer.from(\'notes\')

.select(\'raw_content\')

.eq(\'id\', noteId).single()

// Call Claude API (server-side --- key never reaches browser)

const extracts = await extractFromNote(note.raw_content, studentId)

// Return proposed extracts to client for advisor review

return Response.json({ extracts, status: \'pending_approval\' })

}

**The data flow for AI extraction:**

- Browser: advisor clicks Extract button for a note

- Browser: sends noteId and studentId (UUID) to /api/extract

- Server: fetches note content from database

- Server: calls Claude API with content --- no student name ever sent

- Server: returns proposed extracts to browser

- Browser: displays extracts for advisor review

- Advisor: approves, edits, or rejects each extract

- Browser: sends approved extracts to database

- Database: stores approved extracts in note_extracts table

**4.5 TypeScript and Type Safety**

TypeScript is the language of the entire codebase. It adds static type
checking to JavaScript --- the compiler catches data shape errors before
they become runtime bugs.

For BCC this matters because the data model is complex. A Students
record has 35+ fields. An extraction response has nested objects.
Without types, a typo in a field name fails silently at runtime. With
types, it fails loudly at compile time in the editor.

// Types mirror the database schema

interface Student {

id: string // UUID

student_key: string // e.g. 2027_ChrisBell_a8f3

first_name: string

last_name: string

graduation_year: number

phase_key: \'PRE\' \| \'YOU\' \| \'FIT\' \| \'APP\' \| \'POST\'

current_mode: \'Structured\' \| \'Exploratory\' \| \'Reactive\' \|
\'Reflective\'

status: \'Active\' \| \'Graduated\' \| \'Archived\' \| \'Paused\'

// \... additional fields

}

Supabase can auto-generate TypeScript types from the database schema
using the CLI. This means the types stay in sync with the actual
database automatically.

**4.6 Environment Variables and Secrets**

The application uses environment variables to configure connections to
external services. These variables are never committed to Git.

  --------------------------------------------------------------------------------------
  **Variable**                           **Used In**     **Contains**
  -------------------------------------- --------------- -------------------------------
  NEXT_PUBLIC_SUPABASE_URL               Browser +       Supabase project URL
                                         Server          

  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   Browser only    Supabase publishable key (safe
                                                         to expose)

  SUPABASE_SERVICE_ROLE_KEY              Server only     Supabase admin key (never in
                                                         browser)

  ANTHROPIC_API_KEY                      Server only     Claude API key (never in
                                                         browser)
  --------------------------------------------------------------------------------------

**Local development:**

Variables live in .env.local (in .gitignore --- never committed)

**Production (Vercel):**

Variables are set in Vercel\'s environment variable dashboard --- never
in code

+-----------------------------------------------------------------------+
| **Security Rule**                                                     |
|                                                                       |
| Any variable prefixed NEXT_PUBLIC\_ is visible in the browser. Never  |
| put secrets (API keys, service role keys) in NEXT_PUBLIC\_ variables. |
| The Anthropic API key must always be in a server-only variable,       |
| called only from API routes.                                          |
+-----------------------------------------------------------------------+

**Part V --- The AI Pipeline**

**5.1 AI Philosophy**

The BCC Dashboard uses AI as a co-pilot, not an autopilot. The system is
designed so that AI can do more work than a human advisor could do alone
--- but humans remain in control of every output that matters.

  -----------------------------------------------------------------------
  **AI Can Do**                       **AI Cannot Do**
  ----------------------------------- -----------------------------------
  Extract structured insights from    Send messages to students or
  notes                               families

  Draft personalized emails           Change a student\'s phase

  Flag students at risk               Approve its own extractions

  Propose tasks                       Create tasks directly (must go
                                      through approval)

  Summarize progress                  Modify database records without
                                      advisor review

  Analyze patterns across cohorts     Override advisor judgment on any
                                      decision
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  *This constraint is not just ethical --- it is architectural. The
  approval queue (advising_items table) is the structural gap between AI
  proposals and real actions. Nothing bypasses it. This is called
  \'Advisor Calm\' in the system principles.*

  -----------------------------------------------------------------------

**5.2 The RawPayload → StructuredOutput Pipeline**

The primary AI workflow converts unstructured advisor notes into
structured database records. This is the pipeline that makes the system
valuable.

**Step 1 --- RawPayload**

The advisor types or pastes meeting notes into the Notes entry
interface. The notes are stored verbatim in notes.raw_content --- never
modified, never deleted. This is the permanent human record.

**Step 2 --- Extraction Request**

The advisor clicks Extract. The browser calls /api/extract with the note
ID. The server fetches the raw content and sends it to the Claude API
with a structured extraction prompt.

**Step 3 --- StructuredOutput**

Claude returns a JSON object following a defined schema. The JSON is
stored in notes.structured_output for provenance.
notes.extraction_status is updated to Pending Review.

**Step 4 --- Staging**

The structured output is parsed into proposed extract rows --- one row
per insight. These rows are shown to the advisor in a staging view. They
do not yet exist in the note_extracts table.

**Step 5 --- Advisor Review**

The advisor reviews each proposed extract. They can Approve (creates the
row), Edit then Approve (creates a modified row with advisor_override =
true), or Reject (discards it). Nothing enters the live database without
this step.

**Step 6 --- Live Records**

Approved extracts are written to note_extracts. Each row links back to
the source note via source_note_id for full provenance. The extraction
is complete.

  ------------------------------------------------------------------------
  **Stage**          **Location**                **Status**
  ------------------ --------------------------- -------------------------
  Raw notes          notes.raw_content           Permanent, immutable

  AI JSON output     notes.structured_output     Stored for provenance

  Proposed extracts  Staging UI (memory only)    Pending advisor review

  Approved extracts  note_extracts table         Live, queryable,
                                                 permanent
  ------------------------------------------------------------------------

**5.3 The BCC Syntax Protocol**

Advisors can use a lightweight tagging syntax in their notes to signal
intent explicitly. This helps the extraction engine route information
accurately.

  --------------------------------------------------------------------------
  **Tag**     **Meaning**      **Example**
  ----------- ---------------- ---------------------------------------------
  !task       Proposed action  !task Schedule campus tour before spring
              item             break

  !deadline   Date-sensitive   !deadline Common App opens August 1
              item             

  #insight    Observation      #insight Strong preference for small liberal
              about student    arts colleges

  #risk       Concern or flag  #risk Procrastinating on essay drafts ---
                               needs structured check-ins

  #interest   Student interest #interest Mentioned environmental policy
              noted            three times
  --------------------------------------------------------------------------

These tags are parsed during extraction. The raw_content always
preserves the tags exactly as written. The tags are signals to the AI,
not replacements for it --- the AI still reads the full note and can
extract insights not explicitly tagged.

**5.4 Prompt Design Principles**

The prompts that drive AI extraction and drafting follow consistent
principles to ensure quality and privacy:

**Send only what is needed**

Extraction prompts include only the note content and the student\'s
UUID. No name, no identifying context beyond what is necessary for the
task.

**Define the output schema**

Every extraction prompt specifies the exact JSON schema it expects in
return. This prevents hallucinated structures and makes parsing
reliable.

**Instruct the model on tone and role**

Drafting prompts establish Chris\'s voice: warm, encouraging, organized,
professional, and humane. The prompt describes BCC\'s advising
philosophy so emails feel like Chris wrote them, not like AI wrote them.

**Include the approval reminder**

Every prompt that produces student-facing content includes: \'This draft
requires advisor review before sending. Do not present it as final.\'

**5.5 Token Economics**

Understanding token usage helps design efficient prompts and estimate
costs. At BCC\'s scale, AI costs are negligible --- but good token
hygiene produces better results regardless of cost.

  ------------------------------------------------------------------------
  **Operation**         **Approx        **Approx Cost    **Frequency**
                        Tokens**        (Sonnet)**       
  --------------------- --------------- ---------------- -----------------
  Note extraction       \~900 in + 400  \~\$0.008        Per meeting
  (short meeting)       out                              

  Note extraction (long \~2000 in + 800 \~\$0.018        Per meeting
  session)              out                              

  Email draft (single   \~700 in + 300  \~\$0.007        Per email
  student)              out                              

  Weekly digest summary \~1500 in + 500 \~\$0.015        Weekly
                        out                              

  Full cohort risk      \~8000 in +     \~\$0.08         Monthly
  analysis (50          2000 out                         
  students)                                              
  ------------------------------------------------------------------------

Annual AI costs at full operation (100 students): estimated
\$30-80/year. This is not a meaningful cost concern.

**Model selection guidance:**

- Claude Haiku --- fast tasks: classification, simple extraction, short
  summaries

- Claude Sonnet --- main workhorse: full extraction, email drafting,
  risk analysis

- Claude Opus --- complex reasoning: not required for any current BCC
  use case

**Part VI --- Local and Production Environments**

**6.1 The Two Environments**

The system runs in two completely separate environments. The separation
is a core architectural principle --- not a convenience.

  ------------------------------------------------------------------------
  **Aspect**         **Local Development**      **Production**
  ------------------ -------------------------- --------------------------
  Database           Local Supabase via Docker  Supabase Cloud

  Data               Anonymized test data only  Real student data

  URL                localhost:3000             bccdashboard.com (or
                                                similar)

  Deployment         npm run dev (hot reload)   Vercel (auto-deploy from
                                                GitHub)

  AI calls           Real Claude API calls      Real Claude API calls

  Access             Chris\'s Mac only          Any browser, anywhere
  ------------------------------------------------------------------------

  -----------------------------------------------------------------------
  *Schema syncs between environments via migrations. Data never syncs.
  This is intentional and permanent. Real student data lives only in
  production. Local development uses test data only.*

  -----------------------------------------------------------------------

**6.2 Local Development Setup**

The local stack runs entirely on the developer\'s Mac. Full offline
capability --- no internet required for development work.

**Required tools:**

- Docker Desktop --- runs local Supabase containers

- Supabase CLI --- manages local database, migrations, and cloud
  connection

- Node.js --- runs the Next.js development server

- Cursor --- AI-native code editor

**Starting the local stack:**

\# Start Docker Desktop first (whale in menu bar)

\# Start local Supabase

supabase start

\# Start Next.js dev server

npm run dev

\# App is now running at localhost:3000

\# Local Supabase Studio at localhost:54323

**Stopping:**

\# Stop Next.js: Ctrl+C in terminal

\# Stop Supabase: supabase stop

\# Quit Docker Desktop from menu bar

**6.3 Environment Configuration**

The application knows which database to talk to via environment
variables. Local and production use different .env files:

**.env.local (local development --- never in Git):**

NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key

ANTHROPIC_API_KEY=your_anthropic_key

**Vercel environment variables (production):**

NEXT_PUBLIC_SUPABASE_URL=https://dlxbdepjbvngkgxlhcdk.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable\_\...

ANTHROPIC_API_KEY=your_anthropic_key

Same code. Different config. The application has no idea which
environment it is in --- it just reads the variables.

**6.4 Deploying to Production**

Production deployment is automatic and requires no manual steps:

- Push code to GitHub main branch

- Vercel detects the push automatically

- Vercel builds the Next.js application

- Vercel deploys to production URL

- Takes approximately 60-90 seconds

Schema changes require one additional manual step:

- Write and test migration locally

- Run: supabase db push

- Migration applies to production database

- Then push code to GitHub as normal

+-----------------------------------------------------------------------+
| **Deployment Order**                                                  |
|                                                                       |
| Always push schema changes (supabase db push) before pushing code     |
| that depends on those schema changes. Pushing code first will cause   |
| errors if the new code references tables or columns that don\'t yet   |
| exist in production.                                                  |
+-----------------------------------------------------------------------+

**6.5 The GitHub Repository**

The GitHub repository is the single source of truth for all code and
schema. Everything in the system that is not data lives here.

  -----------------------------------------------------------------------
  **What Lives in GitHub**            **What Does Not Live in GitHub**
  ----------------------------------- -----------------------------------
  All application code (TypeScript,   Environment variables (.env.local)
  TSX)                                

  All migration files (SQL)           Real student data (ever)

  All documentation (this document    Supabase service role keys
  set)                                

  Package configuration               Anthropic API keys

  Deployment configuration            Any personally identifiable
  (vercel.json)                       information
  -----------------------------------------------------------------------

Repository: github.com/chrisbellco2/bcc-dashboard (public, MIT license)

**Part VII --- The Advising Engine (Conceptual)**

The full Advising Engine --- Pathways, Rules, Temporal Anchors,
Cross-Pathway Gates --- is designed but not yet active. The data model
fully supports it. This section documents the architecture for future
implementation.

  -----------------------------------------------------------------------
  *Everything in Part VII is Post-MVP. The data structures are being
  built correctly from day one so this layer can be activated without
  schema changes. But the automation itself is dormant until Phase 4 and
  beyond.*

  -----------------------------------------------------------------------

**7.1 Phases, Modes, and Pathways**

**Phases**

Time-based stages of the advising arc: PRE, YOU, FIT, APP, POST. Only
one phase active per student at a time. Phase changes are manual
(advisor-triggered) in MVP. Each student record stores their current
phase_key, which references the Phase Definitions spine.

**Modes**

The advisor\'s stance and cadence. Stored per student as current_mode.
Affects how frequently tasks are generated, how urgent communications
feel, and what the advisor dashboard emphasizes. Modes are advisory
metadata --- they do not block actions.

  ------------------------------------------------------------------------
  **Mode**      **Cadence**        **Typical     **Alert Threshold**
                                   Phase**       
  ------------- ------------------ ------------- -------------------------
  Structured    Task-heavy,        YOU           14 days without contact
                predictable rhythm               

  Exploratory   Open-ended,        FIT           21 days without contact
                lighter touch                    

  Reactive      Deadline-driven,   APP           3 days without contact
                high urgency                     

  Reflective    Low frequency,     POST          30 days without contact
                check-ins only                   
  ------------------------------------------------------------------------

**Pathways**

Parallel domains of advising logic. Each Pathway covers one dimension of
student development: Academic, Financial, Talent, Process, Calendar,
Developmental, and optional specialized pathways (Athletics, Arts,
Neurodiversity, First-Generation).

Pathways are assigned per student via the student_pathways join table. A
student may have multiple active pathways. Each pathway defines its own
goals, rules, and outputs --- but all share the same timing rails and
effects infrastructure.

**7.2 Temporal Anchors**

Temporal Anchors are the foundation of the BCC timing system. They
convert the flexible, individualized advising timeline into predictable,
automatable triggers.

Rather than using fixed calendar dates, the system defines anchors
relative to each student\'s situation:

- junior_june_1 --- June 1 at the end of the student\'s junior year

- senior_aug_1 --- August 1 before the student\'s senior year

- earliest_deadline --- the earliest real college application deadline
  for this student

- list_finalized --- the date the student\'s final college list is
  confirmed

- kickoff_date --- the first official advising session

Every rule in the system references an anchor plus an offset. Example:
Send kickoff email 2 days after kickoff_date. Update activities list
between junior_june_1 and senior_aug_1.

Anchors are stored as static date fields in the Students table. They are
computed from formula fields (grad year, earliest deadline, etc.) and
written to static fields nightly. The Rule Engine reads static fields
--- never formula fields --- for performance and consistency.

**7.3 The Rule Engine**

The Rule Engine is the automation heart of the system. It runs nightly
(or on-demand), evaluates all active rules against all active students,
and generates proposed actions (AdvisingItems) for advisor review.

**Rule Engine execution order:**

- Update static anchor date fields for all students

- Process Pathway evaluates sequential logic

- Calendar Pathway resolves anchor-relative dates

- All other active Pathways evaluate

- Cross-Pathway Gates check prerequisites

- Emit AdvisingItems (Pending) for each triggered rule

- Advisor reviews and approves items

- Approved items become Tasks or Communications

- Goal status fields update (On Track / At Risk / Met)

- Events Log records all activity

**Idempotency:**

Every rule execution generates a unique hash: SHA256(student_id +
rule_id + trigger_date). If the rule fires again with the same hash, it
does not create a duplicate AdvisingItem. This prevents runaway
automation.

**Where the Rule Engine runs:**

Not inside the database. Not inside Airtable automations (the original
approach). The Rule Engine runs as a Next.js API route that can be
triggered by a cron job (Vercel Cron), an advisor manual trigger, or a
webhook. This keeps heavy logic outside the database and makes it fully
testable.

**7.4 Cross-Pathway Gates**

Gates enforce coordination between Pathways. A gate says: before this
rule fires, a prerequisite in another Pathway must be met.

Example: Before List Building begins (Process Pathway), require
Financial Aid Discussion = Met (Financial Pathway). If the gate is not
met, an AdvisingItem is emitted: Schedule Financial Meeting.

In MVP, all gates are soft --- they produce warnings and suggestions,
not hard blocks. The advisor remains in control. Hard gates are a
Post-MVP feature.

**Part VIII --- Performance, Governance, and Future**

**8.1 Performance Considerations**

At BCC\'s current scale (50-100 active students), performance is not a
concern. Postgres handles this volume trivially. But the architecture is
designed to remain performant as the system grows.

**Key performance principles:**

- Students table stays lean --- detailed data lives in tall tables, not
  in wide student records

- Indexes on all frequently-queried fields (graduation_year, phase_key,
  status, lead_advisor)

- Temporal anchor fields are static dates --- computed nightly, not
  recalculated on every query

- Heavy logic (Rule Engine) runs externally --- never inside database
  triggers or real-time queries

- Annual archival of graduated student records keeps active dataset
  small

**Supabase free tier limits (for reference):**

  ------------------------------------------------------------------------
  **Resource**       **Free Tier Limit**   **BCC Projected Usage**
  ------------------ --------------------- -------------------------------
  Database rows      Unlimited             \~25,000 at 100 students (full
                                           year)

  Database size      500 MB                \< 50 MB at BCC scale

  API requests       Unlimited             Well within normal usage

  Auth users         50,000                \< 200 (advisors + students +
                                           parents)
  ------------------------------------------------------------------------

Supabase Pro (\$25/month) becomes relevant only if storage or advanced
features (daily backups, PITR) are needed. Not required at MVP.

**8.2 Archival Strategy**

The system performs annual archival every July to keep the active
database lean and performant. This also fulfills the privacy obligation
to not retain student data indefinitely.

**What gets archived:**

- Students who graduated in the prior cycle

- All linked tall table records (notes, tasks, extracts, communications,
  applications, decisions)

- All Events Log entries for archived students

**What stays:**

- Alumni Case Profiles (de-identified learning artifacts)

- Spine records (colleges, assessments, pathways) --- still relevant
  next year

- System-wide Events Log entries

**How it works:**

- Export archived student records to CSV (Google Drive cold storage)

- Update student status to Archived

- Delete tall table records for archived students

- Log archival event in Governance Log

- Verify record counts, performance restored

**8.3 Privacy and Data Governance**

BCC operates under IEC professional ethics and FERPA-adjacent privacy
expectations. The system enforces these structurally.

  -----------------------------------------------------------------------
  **Principle**         **How It Is Enforced**
  --------------------- -------------------------------------------------
  No PII in AI prompts  Only UUID sent to Claude API. Name resolved
                        server-side after extraction.

  No student data in    .gitignore covers all .env files. Migration files
  GitHub                contain no data.

  Advisor approval on   Advising Items queue is structural --- no bypass
  all AI outputs        path exists.

  Family visibility     RLS policies enforce what students and parents
  control               can see. Advisor-only fields never exposed.

  Data retention limits Annual archival process removes identifiable
                        records per retention policy.

  Alumni Case Profiles  De-identified learning artifacts persist after
                        student data is deleted.
  -----------------------------------------------------------------------

**8.4 The Giving-It-Away Architecture**

The system is designed to be given to the IEC community. Every
architecture decision has been evaluated against this goal.

**What makes it giveable:**

- No BCC-specific logic in the schema --- phases, pathways, and
  curricula are all configurable data

- All migrations in Git --- anyone can build the exact same schema from
  scratch

- Provider independence --- no dependency on services that require
  Chris\'s accounts

- MIT license --- complete freedom to use, modify, and distribute

- Self-contained local setup --- no paid services required to develop

- Developer Guide (Document 05) explains everything needed to get
  started

**What the recipient needs:**

- A Supabase account (free)

- A Vercel account (free)

- A GitHub account (free)

- An Anthropic API account (pay per use, trivial cost)

- Node.js and Docker installed locally

- Basic comfort with a terminal

Chris will not provide ongoing support. The documentation must stand on
its own. This document set is the support.

**8.5 Future Evolution**

The architecture is designed to evolve without structural rework. Future
capabilities layer on top of the existing foundation:

  --------------------------------------------------------------------------
  **Phase**   **Capability**        **Foundation Already Built**
  ----------- --------------------- ----------------------------------------
  Phase 2     Student/Parent portal RLS policies, Supabase Auth, students
                                    table

  Phase 3     Rule Engine           advising_rules and advising_items tables
              activation            designed

  Phase 4     Temporal Anchor       anchor fields in students table,
              automation            calculation logic designed

  Phase 5     Full Pathways         student_pathways join table, pathways
              implementation        spine

  Phase 6     Application Tracker + application_records and colleges spine
              ADR                   designed

  Phase 7     College matching      note_extracts provide student preference
              engine                data

  Phase 8     Virtual Advisor       Full AI pipeline, Rule Engine, portal
              (self-service)        infrastructure

  Future      Multi-advisor teams   lead_advisor field, RLS policies
                                    designed for expansion
  --------------------------------------------------------------------------

  -----------------------------------------------------------------------
  *The system is intentionally overbuilt relative to the MVP. Designing a
  system that outclasses the tool --- or outpaces current needs --- is
  much better than the inverse. The architecture can grow without rework.
  That is the point.*

  -----------------------------------------------------------------------

**Appendix A --- Architectural Rules Summary**

These rules apply to every technical decision in the BCC Dashboard. They
are non-negotiable.

  -----------------------------------------------------------------------
  **Rule**              **Statement**
  --------------------- -------------------------------------------------
  AI-First,             AI proposes. Humans approve. Nothing reaches a
  Human-Verified        student without advisor review.

  Privacy by Design     UUID only to AI. No PII in GitHub. RLS enforced
                        on all tables. Data deleted per retention policy.

  Provider Independence Every external service sits behind an abstraction
                        layer. One file to swap any provider.

  Advisor Calm          No surprises. No silent automation. No student
                        receives anything unapproved. Everything is
                        logged.

  Provenance Everywhere Every action tracks source, timestamp, rule ID,
                        and phase context. Events Log is append-only.

  Migrations for        No schema changes outside versioned SQL files.
  Everything            Every change tracked in Git.

  Dual-Key Identity     UUID for system integrity and AI calls.
                        student_key for human display. Never confuse the
                        two.

  Deployment Order      Schema changes (supabase db push) always before
                        code that depends on them.

  Append-Only Events    Events Log and Governance Log never have rows
  Log                   deleted. Ever.

  Students Table Stays  Detailed data lives in tall tables. Students
  Lean                  table is an anchor, not a dumping ground.
  -----------------------------------------------------------------------

**Appendix B --- Key Files Reference**

  ---------------------------------------------------------------------------
  **File**                   **Purpose**
  -------------------------- ------------------------------------------------
  lib/supabase/client.ts     Supabase client --- the database abstraction
                             layer

  lib/ai/extract.ts          AI extraction abstraction --- calls Anthropic
                             API

  lib/ai/draft.ts            AI drafting abstraction --- generates email
                             drafts

  app/api/extract/route.ts   Server-side extraction endpoint (AI key never
                             reaches browser)

  app/api/draft/route.ts     Server-side drafting endpoint

  supabase/migrations/       All SQL migration files --- schema history

  .env.local                 Local environment variables (never in Git)

  docs/                      This document set
  ---------------------------------------------------------------------------

**Appendix C --- Glossary**

  -----------------------------------------------------------------------
  **Term**           **Definition**
  ------------------ ----------------------------------------------------
  Spine              A stable master table defining entities in the
                     system (Students, Colleges, etc.)

  Tall Table         A growing event table storing instances over time
                     (Notes, Tasks, Extracts, etc.)

  RawPayload         Verbatim unstructured content (meeting notes,
                     transcripts) stored without modification

  StructuredOutput   AI-generated JSON derived from a RawPayload, stored
                     for provenance

  Extract            A single structured insight derived from
                     StructuredOutput (one row in note_extracts)

  Temporal Anchor    A student-relative date used to drive timing (e.g.
                     junior_june_1)

  Pathway            A domain of advising logic (Academic, Financial,
                     Talent, etc.)

  Phase              A time-based stage of the advising arc (PRE, YOU,
                     FIT, APP, POST)

  Mode               The advisor\'s current stance for a student
                     (Structured, Exploratory, Reactive, Reflective)

  AdvisingRule       A stored logic instruction describing a condition,
                     trigger, and effect

  AdvisingItem       A proposed action from the Rule Engine pending
                     advisor approval

  Migration          A versioned SQL file that makes one defined change
                     to the database schema

  RLS                Row Level Security --- Postgres access control
                     enforced at the database level

  student_key        Human-readable student identifier
                     (2027_ChrisBell_a8f3)

  id                 UUID primary key --- used for all foreign keys and
                     AI interactions
  -----------------------------------------------------------------------

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
