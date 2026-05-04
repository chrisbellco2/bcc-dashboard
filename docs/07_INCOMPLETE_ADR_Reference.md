**BCC Dashboard --- ADR Reference**

Version 0.1 --- May 2026

*Application Deadlines and Requirements --- INCOMPLETE Placeholder*

+-----------------------------------------------------------------------+
| **INCOMPLETE DOCUMENT**                                               |
|                                                                       |
| This document is a placeholder. Content will be written when the      |
| relevant system phase is built. The structure and section headings    |
| are intentional --- they define what will be here. The details are    |
| not yet written.                                                      |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  *This document will be written when the ADR subsystem is implemented in
  Phase 6. Until then, refer to the original Appendix E (ADR Technical
  Reference) from the legacy documentation set for the conceptual
  design.*

  -----------------------------------------------------------------------

**Document Purpose**

The ADR (Application Deadlines and Requirements) subsystem manages
college-specific application data: deadlines by round, required
materials, supplemental essays, and policy details. This reference
defines the data model, update protocols, and how ADR data flows into
the student advising experience.

**Part I --- ADR Overview**

**1.1 What ADR Manages**

CONTENT TO BE WRITTEN --- Will cover: Early Decision, Early Action,
Regular Decision deadlines per college; required materials per round;
supplemental essay requirements; test policies (required, test-optional,
test-free); interview policies; financial aid deadlines.

**1.2 ADR vs College Spine**

CONTENT TO BE WRITTEN --- Will explain why deadline data lives
separately from the colleges spine. Colleges spine = permanent stable
attributes. ADR = cycle-specific, changes annually.

**1.3 The Annual Update Problem**

CONTENT TO BE WRITTEN --- Will explain how ADR data is verified and
updated each cycle, change impact tracking, and the versioning approach.

**Part II --- ADR Data Model**

**application_deadlines Table**

CONTENT TO BE WRITTEN --- Field definitions when migration is written.
Will include: college_id, cycle_year, round (ED1/ED2/EA/RD/Rolling),
deadline_date, materials_due, financial_aid_deadline,
interview_deadline.

**application_requirements Table**

CONTENT TO BE WRITTEN --- Field definitions when migration is written.
Will include: required essays, rec letter count, test policy, interview
policy, additional materials.

**adr_change_log Table**

CONTENT TO BE WRITTEN --- Tracks changes to deadline data with impact
assessment: which students are affected by a deadline change.

**Part III --- ADR in Practice**

**How Deadlines Surface in the Dashboard**

CONTENT TO BE WRITTEN --- Will cover how application_records links to
ADR, how the Calendar Pathway uses deadline data to generate tasks, and
how the advisor sees upcoming deadlines per student.

**Annual Update Protocol**

CONTENT TO BE WRITTEN --- Step-by-step process for updating ADR data at
the start of each application cycle.

**Data Sources**

CONTENT TO BE WRITTEN --- Will define authoritative sources for deadline
data (college websites, Common App, Coalition App) and verification
protocol.

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
