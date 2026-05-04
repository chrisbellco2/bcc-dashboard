**BCC Dashboard --- Developer Guide**

Version 1.0 --- May 2026

*How to set up, run, contribute to, and deploy the BCC Dashboard*

  -----------------------------------------------------------------------
  *Who this document is for: Any developer picking up this codebase ---
  whether that is Chris Bell working on his own system, or an IEC
  counselor who has forked the repo and wants to deploy their own
  instance. This document assumes basic comfort with a terminal but
  explains everything else.*

  -----------------------------------------------------------------------

**Part I --- Prerequisites**

**1.1 Required Software**

  ---------------------------------------------------------------------------------------------
  **Tool**      **Version**   **Install**                          **Purpose**
  ------------- ------------- ------------------------------------ ----------------------------
  Node.js       18+           brew install node                    Runs the Next.js development
                                                                   server

  Git           Any           brew install git                     Version control

  Docker        Latest        docker.com/products/docker-desktop   Runs local Supabase stack
  Desktop                                                          

  Supabase CLI  Latest        brew install supabase/tap/supabase   Manages migrations and local
                                                                   database

  Cursor        Latest        cursor.com                           AI-native code editor
                                                                   (recommended)

  Homebrew      Latest        See brew.sh                          Package manager for Mac
  (Mac)                                                            
  ---------------------------------------------------------------------------------------------

**1.2 Required Accounts**

  ------------------------------------------------------------------------------------
  **Service**   **URL**                 **Cost**           **Purpose**
  ------------- ----------------------- ------------------ ---------------------------
  GitHub        github.com              Free               Code repository and version
                                                           control

  Supabase      supabase.com            Free tier          Database hosting, auth, API
                                        sufficient         

  Vercel        vercel.com              Free tier          Application deployment
                                        sufficient         

  Anthropic     console.anthropic.com   Pay per use        Claude API for AI features
                                        (\~\$30-80/year)   
  ------------------------------------------------------------------------------------

**1.3 Mac Setup (First Time Only)**

Run these commands in Terminal in order. Each step verifies before
continuing.

**Step 1 --- Install Homebrew:**

/bin/bash -c \"\$(curl -fsSL
https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"

brew \--version \# Verify

**Step 2 --- Install Git, Node, Supabase CLI:**

brew install git node supabase/tap/supabase

git \--version && node \--version && supabase \--version \# Verify all
three

**Step 3 --- Install Docker Desktop:**

Download Apple Silicon version from docker.com/products/docker-desktop.
Open Docker after installing and wait for the whale icon in your menu
bar.

docker \--version \# Verify

**Step 4 --- Install Cursor:**

Download from cursor.com. Open and sign in with GitHub.

**Part II --- Getting the Code**

**2.1 Clone the Repository**

mkdir -p \~/Developer

cd \~/Developer

git clone https://github.com/chrisbellco2/bcc-dashboard.git

cd bcc-dashboard

**2.2 Install Dependencies**

npm install

**2.3 Set Up Environment Variables**

Create a .env.local file in the project root:

touch .env.local

Add the following to .env.local (get values from your Supabase and
Anthropic dashboards):

\# Local Supabase (used during development)

NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key

\# Anthropic API (server-side only)

ANTHROPIC_API_KEY=your_anthropic_api_key

  -----------------------------------------------------------------------
  ⚠ .env.local is in .gitignore and must never be committed to GitHub. It
  contains secrets.

  -----------------------------------------------------------------------

**Part III --- Running Locally**

**3.1 Start the Local Stack**

Every development session starts with these three steps, in order:

**Step 1 --- Open Docker Desktop**

Launch Docker Desktop from Applications. Wait for the whale icon to
appear in your menu bar. Docker must be running before Supabase can
start.

**Step 2 --- Start Local Supabase**

supabase start

First run takes 2-3 minutes as Docker pulls images. Subsequent runs take
about 30 seconds. When complete, you will see local URLs including:

- API URL: http://localhost:54321

- Studio URL: http://localhost:54323

- Anon key: (copy this into your .env.local)

**Step 3 --- Start Next.js Dev Server**

npm run dev

Your app is now running at http://localhost:3000

**3.2 Supabase Studio (Local)**

Supabase Studio is a visual database interface --- equivalent to
Airtable\'s grid view but for Postgres. Access it at
http://localhost:54323 while local Supabase is running.

- View and edit table data

- Run SQL queries directly

- Inspect table structure

- View RLS policies

**3.3 Stopping the Local Stack**

\# Stop Next.js dev server

Ctrl+C (in the terminal running npm run dev)

\# Stop local Supabase

supabase stop

\# Quit Docker Desktop from menu bar

**3.4 Your Daily Development Workflow**

1.  Open Docker Desktop --- wait for whale icon

2.  Run: supabase start

3.  Open Cursor → open bcc-dashboard folder

4.  Run: npm run dev (in Cursor\'s terminal)

5.  Open browser to localhost:3000

6.  Open this Claude conversation for architecture/planning questions

7.  Write code, see changes instantly in browser

8.  Commit and push when a feature is working

**Part IV --- Working with the Database**

**4.1 Writing a Migration**

Every database change --- adding a table, adding a column, changing a
type --- is made through a migration file. Never click around in
Supabase Studio to change schema.

**Create a new migration:**

supabase migration new describe_what_you_are_changing

This creates a timestamped file in supabase/migrations/. Open that file
and write your SQL.

**Example migration --- adding a field:**

\-- Add needs_attention flag to students

ALTER TABLE students

ADD COLUMN needs_attention boolean NOT NULL DEFAULT false;

CREATE INDEX students_needs_attention_idx ON students(needs_attention);

**4.2 Testing a Migration Locally**

\# Apply migration to local database

supabase db reset

\# OR apply only new migrations without resetting data

supabase migration up

Verify the change worked in Supabase Studio (localhost:54323) before
pushing to production.

**4.3 Pushing to Production**

\# Push all pending migrations to production Supabase

supabase db push

  -----------------------------------------------------------------------
  ⚠ Always push schema changes (supabase db push) BEFORE pushing code
  that depends on those changes. Pushing code first will cause errors in
  production.

  -----------------------------------------------------------------------

**4.4 Migration Rules**

- Never edit a migration file that has already been pushed to production

- If you need to undo something, write a new migration that reverses it

- Always test migrations locally before pushing

- Commit migration files to GitHub in the same commit as the code that
  uses them

- Migration file names must be descriptive: what changed, not when

**Part V --- Deploying to Production**

**5.1 First-Time Production Setup**

**Connect Vercel to GitHub:**

9.  Go to vercel.com and sign in with GitHub

10. Click Add New Project

11. Select the bcc-dashboard repository

12. Vercel detects Next.js automatically --- accept defaults

13. Add environment variables (from your production Supabase project):

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable\_\...

ANTHROPIC_API_KEY=your_anthropic_key

14. Click Deploy

**Connect your domain (optional):**

In Vercel project settings → Domains → add your domain. Then update DNS
at your registrar to point to Vercel. Takes 10-30 minutes to propagate.

**5.2 Ongoing Deployments**

After initial setup, deployment is automatic:

\# Schema change

supabase db push

\# Code change

git add .

git commit -m \"feat: description of what you built\"

git push

\# Vercel detects the push and deploys automatically

\# Takes approximately 60-90 seconds

**5.3 Production Hardening Checklist**

Complete these before using the system with real student data:

- Enable SSL enforcement in Supabase project settings

- Write and test RLS policies for all tables

- Enable Point-in-Time Recovery (PITR) backups --- Supabase Pro required

- Set up custom SMTP for auth emails (Supabase project settings)

- Verify .env.local is not in GitHub (check .gitignore)

- Confirm Anthropic API key is in Vercel env vars, not in code

- Test that unauthorized users cannot access student data

**Part VI --- Code Conventions**

**6.1 Commit Message Format**

  -------------------------------------------------------------------------
  **Prefix**   **When To Use**        **Example**
  ------------ ---------------------- -------------------------------------
  feat:        New feature or         feat: add notes entry interface
               capability             

  fix:         Bug fix                fix: correct RLS policy for students

  chore:       Config, dependencies,  chore: update Supabase client
               tooling                

  docs:        Documentation changes  docs: update Data Dictionary for
                                      notes table

  migration:   Schema change (use     migration: add student_key to
               alongside feat/fix)    students
  -------------------------------------------------------------------------

**6.2 File Naming**

- Components: PascalCase --- StudentCard.tsx, WeeklyReview.tsx

- Utilities and lib files: camelCase --- extractNote.ts, buildPrompt.ts

- API routes: kebab-case folders --- app/api/extract-note/route.ts

- Migration files: auto-generated timestamp prefix, snake_case
  description

**6.3 The Abstraction Layer Rule**

The application never calls external service SDKs directly from page or
component files. All external calls go through lib/:

- Database: always through lib/supabase/client.ts

- AI: always through lib/ai/extract.ts or lib/ai/draft.ts

- Email: always through lib/email/send.ts (when built)

This makes providers swappable. It also makes testing easier --- mock
the lib/ functions, not the external SDK.

**6.4 Privacy Rules in Code**

- Never pass student_key or full_name to AI API calls --- pass id (UUID)
  only

- Never log student names to console or server logs

- Never include student data in error messages

- Resolve student name server-side after AI processing, never before

**Part VII --- Troubleshooting**

**7.1 Common Problems**

  ------------------------------------------------------------------------
  **Problem**        **Likely Cause**      **Fix**
  ------------------ --------------------- -------------------------------
  supabase start     Docker not running    Open Docker Desktop and wait
  fails                                    for whale icon

  localhost:3000 not npm run dev not       Run npm run dev in project
  loading            started               directory

  Database changes   Migration not applied Run supabase migration up or
  not showing                              supabase db reset

  Supabase CLI       Session expired       Run supabase login
  error: not logged                        
  in                                       

  Vercel deploy      Build error in code   Check Vercel dashboard for
  fails                                    error details

  RLS blocking all   Policy not written    Add RLS policy in Supabase
  data               yet                   dashboard or via migration

  AI extraction      API key missing or    Check ANTHROPIC_API_KEY in
  returning errors   wrong                 .env.local
  ------------------------------------------------------------------------

**7.2 Useful Commands Reference**

  -----------------------------------------------------------------------
  **Command**                 **Does**
  --------------------------- -------------------------------------------
  supabase start              Start local Supabase stack (requires
                              Docker)

  supabase stop               Stop local Supabase stack

  supabase db push            Apply pending migrations to production

  supabase migration up       Apply pending migrations to local database

  supabase db reset           Reset local database and apply all
                              migrations from scratch

  supabase migration new      Create a new migration file
  \<name\>                    

  supabase login              Authenticate CLI with Supabase account

  supabase link               Link local project to Supabase cloud
  \--project-ref \<id\>       project

  npm run dev                 Start Next.js development server

  npm run build               Build production bundle (useful for
                              catching errors)

  git add . && git commit -m  Stage and commit all changes
  \'\...\'                    

  git push                    Push to GitHub (triggers Vercel deploy)
  -----------------------------------------------------------------------

**Part VIII --- Forking for Your Own Practice**

**8.1 If You Are an IEC Setting Up Your Own Instance**

This system is released under the MIT license. You are free to use it,
fork it, modify it, and run it for your own practice. Here is what you
need to do:

15. Fork the repository on GitHub (click Fork on
    github.com/chrisbellco2/bcc-dashboard)

16. Clone your fork locally

17. Create your own Supabase project at supabase.com

18. Create your own Vercel project connected to your fork

19. Create your own Anthropic account at console.anthropic.com

20. Follow the setup instructions in this document

21. Run all migrations to build your database schema

22. Add your own advisor accounts in Supabase Auth

23. Start entering students

**8.2 What You Will Need to Customize**

- Lead advisor names (currently Chris --- update in students table
  defaults)

- Phase definitions (if you use different terminology than YOU/FIT/APP)

- Curriculum programs (if you have different advising tracks)

- Email templates and voice (prompts in lib/ai/draft.ts reflect Chris\'s
  voice)

- Branding and colors (Tailwind classes in components)

**8.3 What You Do Not Need to Customize**

- The data model --- it is generic by design

- The migration system --- it works the same for any practice

- The AI pipeline --- provider-independent and reusable

- The weekly review logic --- universal to all IEC practices

- The privacy and RLS architecture --- correct for any practice

**8.4 Support**

Chris Bell does not provide ongoing support for forks of this system.
The documentation set (Documents 01-11) is the support. If something is
unclear, the answer is either in these documents or should be added to
them.

GitHub Issues on the original repository are monitored but responses are
not guaranteed. The community is encouraged to contribute improvements
via Pull Request.

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
