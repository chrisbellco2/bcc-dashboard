**BCC Dashboard --- Privacy and Governance Guide**

Version 1.0 --- May 2026

*Data boundaries, retention policy, AI limits, and alumni case profiles*

  -----------------------------------------------------------------------
  *This document is complete for the current build phase. It will be
  updated as new features are built. Privacy and governance rules are
  non-negotiable --- they apply to every technical decision.*

  -----------------------------------------------------------------------

**Part I --- Privacy Philosophy**

**1.1 The Foundational Commitment**

BCC Dashboard handles sensitive information about minors and families in
the context of a professional advising relationship. This creates both
ethical obligations and practical responsibilities.

The system is designed so that privacy is enforced structurally --- not
just as policy. Structural constraints are more reliable than policy
alone because they cannot be accidentally bypassed by a bug or an
oversight.

Three structural mechanisms enforce privacy in this system:

- Row Level Security (RLS) --- the database itself refuses unauthorized
  queries

- The dual-key pattern --- the AI never receives identifying information
  by design

- The approval queue --- no AI output reaches a student without human
  review

**1.2 Who This Data Belongs To**

Student data belongs to students and families. BCC holds it in trust for
the duration of the advising relationship. The system is designed to
reflect this:

- Data is collected only for advising purposes

- Data is retained only as long as needed

- Data is deleted per retention policy, not accumulated indefinitely

- Families have a right to know what data is held about them

- Alumni Case Profiles preserve professional learning without preserving
  identity

**Part II --- Data Boundaries**

**2.1 What Data Lives Where**

  -------------------------------------------------------------------------------
  **Data Type**      **Stored In**           **Who Can See**    **Retention**
  ------------------ ----------------------- ------------------ -----------------
  Student identity   students table          Advisors only      Deleted at
  (name, email, DOB) (production DB only)    until portal built archival

  Meeting notes      notes table             Advisors only      Deleted at
  (raw)                                                         archival

  AI-extracted       note_extracts table     Advisors;          Deleted at
  insights                                   student-facing     archival
                                             fields via portal  
                                             (Phase 2)          

  Communications     communications table    Advisors and       Deleted at
  sent                                       relevant           archival
                                             student/family     

  College list       application_records +   Advisors and       Deleted at
                     CPP (master)            student/family     archival

  Alumni Case        Separate de-identified  Advisors only      Permanent
  Profiles           store                                      

  Events Log         events_log table        Advisors and       Permanent
                                             system only        (de-identified at
                                                                archival)
  -------------------------------------------------------------------------------

**2.2 Data That Must Never Go to GitHub**

- Any student name, email, or identifier

- Any family contact information

- Any API keys or service credentials

- Any database passwords or connection strings

- Any content from student notes or communications

  -----------------------------------------------------------------------
  ⚠ The .gitignore file covers .env files. It does not prevent someone
  from accidentally committing a file containing student data with a
  different extension. Always check what you are committing before
  pushing.

  -----------------------------------------------------------------------

**2.3 Data That Must Never Go to AI APIs**

- Student full name

- Student email address

- Parent names or contact information

- Any field that identifies the specific student

The correct pattern: send the student UUID only. Resolve the student\'s
context server-side before and after the AI call. The AI processes
content without ever knowing whose it is.

// CORRECT --- send UUID only

const extracts = await extractFromNote(note.raw_content, student.id)

// WRONG --- never do this

const extracts = await extractFromNote(note.raw_content,
student.full_name)

**2.4 Advisor-Only vs Family-Facing Data**

  -------------------------------------------------------------------------------------------
  **Field / Data**           **Advisors**   **Students**   **Parents**   **Notes**
  -------------------------- -------------- -------------- ------------- --------------------
  internal_notes             ✅             ❌             ❌            Advisor-only always

  legacy_student_variables   ✅             ❌             ❌            Advisor-only always

  phase_key and current_mode ✅             ❌             ❌            Operational metadata

  Assigned tasks             ✅             ✅ (own)       ✅ (child\'s) When portal is built

  College list               ✅             ✅ (own)       ✅ (child\'s) Via CPP currently

  Communications sent        ✅             ✅ (own)       ✅ (relevant) Via CPP currently

  Note extracts (insights)   ✅             Selected only  Selected only Advisor decides per
                                                                         field
  -------------------------------------------------------------------------------------------

**Part III --- AI Governance**

**3.1 What AI Is Permitted to Do**

  -----------------------------------------------------------------------
  **Permitted**          **Rationale**
  ---------------------- ------------------------------------------------
  Extract structured     Core value function. Human-verified before use.
  insights from notes    

  Draft personalized     Saves advisor time. Human-approved before
  communications         sending.

  Flag students at risk  Surfaces patterns. Advisor interprets and acts.

  Propose tasks based on Reduces cognitive load. Human-approved before
  note content           creation.

  Summarize progress     Analytical function. Human reviews output.
  across a cohort        

  Score college fit      Advisory only. Human makes final decisions.
  against student        
  preferences            
  -----------------------------------------------------------------------

**3.2 What AI Is Not Permitted to Do**

  -----------------------------------------------------------------------
  **Prohibited**         **Why**
  ---------------------- ------------------------------------------------
  Send any message to a  Advisor Calm principle. No exceptions.
  student or family      

  Change a student\'s    Advisor judgment required. Cannot be automated.
  phase or mode          

  Approve its own        Conflict of interest. Human review is mandatory.
  extraction outputs     

  Access data from other Cross-contamination of student data is
  students to inform a   prohibited.
  single student\'s      
  output                 

  Store student data in  Anthropic API is ephemeral by default. No
  its own memory or      persistent storage of student data in AI
  context                systems.

  Make enrollment or     Outside scope of this system. Refer to human
  financial              experts.
  recommendations        
  -----------------------------------------------------------------------

**3.3 Anthropic API Data Handling**

By default, Anthropic does not use API request data to train models. API
calls are ephemeral --- data sent in a request is not stored by
Anthropic after the response is returned.

This means that meeting notes and student context sent via the API do
not persist in Anthropic\'s systems. They are processed and returned,
then discarded.

  -----------------------------------------------------------------------
  *This is the current Anthropic policy as of May 2026. Verify current
  policy at anthropic.com/privacy before deploying with real student
  data. If policy changes, review the AI governance section of this
  document.*

  -----------------------------------------------------------------------

**3.4 Model Version Logging**

Every AI extraction and draft logs the model version used
(notes.ai_model_version). This provides an audit trail if a model update
changes extraction behavior, and supports reproducibility reviews.

**Part IV --- Retention Policy**

**4.1 Active Students**

All data for active students is retained in the production database for
the full duration of the advising relationship. No automatic deletion
occurs during active engagement.

**4.2 Annual Archival (Every July)**

Each July, students who graduated in the prior cycle are archived. The
archival process:

1.  Export all student records and linked data to CSV (Google Drive cold
    storage)

2.  Create Alumni Case Profile (de-identified --- see section 4.4)

3.  Update student status to Archived

4.  Delete all tall table records for archived students (notes, tasks,
    extracts, communications, applications, decisions, test results,
    transcript courses)

5.  Retain events_log entries but strip student_id linkage

6.  Log archival operation in governance_log

7.  Verify record counts and performance improvement

**4.3 Data Requested for Deletion**

If a family requests deletion of their data before natural archival:

8.  Verify the request is from an authorized party (student 18+ or
    parent/guardian)

9.  Export data to provide to family if requested

10. Delete all records following the archival process above

11. Log deletion request and completion in governance_log

12. Confirm completion to requesting party

**4.4 Alumni Case Profiles**

Alumni Case Profiles are de-identified records that preserve
professional learning after student data is deleted. They contain:

- Graduation year (no specific identifying information)

- Phase/mode progression summary

- College application outcomes (anonymized)

- Key advising themes and approaches that were effective

- No name, email, school name, or other identifying information

These profiles inform future advising practice and can be used in
professional development contexts without privacy concerns.

**Part V --- Governance Log**

**5.1 What the Governance Log Records**

The governance_log table records system-level events that are distinct
from student-level events (which go in events_log):

- Annual archival operations (date, students archived, records deleted)

- Data deletion requests and completions

- Policy changes to this document

- Manual schema changes (if any are ever made outside migrations)

- Security events (unauthorized access attempts, policy violations)

- Advisor account changes (new advisors added, accounts deactivated)

- AI provider changes (if Claude is replaced with another model)

**5.2 Governance Log Is Permanent**

Like the events_log, the governance_log is append-only. Records are
never deleted. It is the system\'s institutional memory of how it has
been operated.

**Part VI --- For IECs Deploying Their Own Instance**

**6.1 Your Responsibilities**

If you fork and deploy this system for your own practice, you take on
the privacy and governance responsibilities described in this document.
The MIT license grants you permission to use the software --- it does
not transfer responsibility for how you handle student data.

You are responsible for:

- Complying with FERPA and applicable state privacy laws

- Notifying families of how their data is stored and used

- Implementing appropriate retention and deletion policies

- Securing your Supabase and Vercel environments

- Keeping Anthropic API keys private and secure

- Reviewing Anthropic\'s current data handling policies before deploying

**6.2 Recommended Additions for Your Instance**

- Add a privacy notice to your student onboarding process

- Document your retention policy in your engagement agreement

- Consider adding a data deletion request workflow to your student
  portal

- Review your professional liability insurance for technology-related
  coverage

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
