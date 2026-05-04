**BCC Dashboard --- Weekly Review Playbook**

Version 1.0 --- May 2026

*How to run the Monday morning student review*

  -----------------------------------------------------------------------
  *This playbook describes the intended weekly review process. Some
  features referenced (notes entry, extraction, task management) are
  being built now. Steps marked \[CURRENT\] reflect how things work
  today. Steps marked \[WHEN BUILT\] reflect the intended workflow once
  features are complete.*

  -----------------------------------------------------------------------

**Part I --- What the Weekly Review Is**

**1.1 Purpose**

The weekly review is the advisor\'s primary rhythm tool. It answers
three questions every week without having to mentally stitch together
information from multiple systems:

  -----------------------------------------------------------------------
  **Question**     **What It Tells You**  **Action It Drives**
  ---------------- ---------------------- -------------------------------
  Who has the      Which students are     Reach out to students who have
  ball?            waiting on me, vs      been waiting too long
                   which are working on   
                   something              

  Who needs        Which students are at  Schedule check-ins, escalate
  attention?       risk, inactive, or     urgent situations
                   flagged                

  Who is new this  Students recently      Initiate onboarding tasks and
  week?            added to the system    kickoff meetings
  -----------------------------------------------------------------------

The review is designed to take 10-20 minutes on a Monday morning. It is
not a deep dive into individual students --- it is a triage and
prioritization exercise. Individual student work happens in student
detail pages.

**1.2 When to Run It**

Monday morning, before client communications begin. The review sets the
advisor\'s priority list for the week.

A lighter version can be run mid-week (Wednesday) to check on anything
that needs follow-up from Monday decisions.

**1.3 Who Runs It**

Chris runs the review independently. When Gav was advising, both
advisors would run the review and briefly sync on shared students. The
dashboard shows all students regardless of lead advisor, with filtering
available by advisor name.

**Part II --- The Three Sections**

**2.1 New Students**

Students whose records were created in the last 7 days. These are
students who are new to the system --- not necessarily new to BCC.

**What you see:**

- Student name, graduation year, phase, lead advisor

- Date added to the system

- Source (CPP import, manual entry)

**What to do:**

- Verify the record is complete (all key fields populated)

- Confirm lead advisor assignment is correct

- Initiate kickoff tasks if not already created

- Schedule first advising session if not already booked

**2.2 Ball Check**

Active students who have not had a note entered in the last 14 days.
These are students where it is unclear who has the next action.

**What you see:**

- Student name, graduation year, phase, lead advisor

- Last contact date (date of most recent note)

- Days since last contact

**What to do:**

- For each student, determine: does the student have something to work
  on, or is the advisor waiting to hear from them?

- If student has the ball: no action needed, monitor

- If advisor has the ball: send a follow-up, schedule a meeting

- If unclear: reach out to re-establish contact

  -----------------------------------------------------------------------
  *The 14-day threshold is a default. Different modes have different
  natural rhythms. Structured mode students warrant attention after 10
  days. Reflective mode students may be fine at 30 days. Use judgment.*

  -----------------------------------------------------------------------

**2.3 Needs Attention**

Active students who are manually flagged (needs_attention = true) OR who
have not had contact in 21+ days regardless of phase. These are the
highest priority students.

**What you see:**

- Student name, graduation year, phase, lead advisor

- Why they appear (flagged, or days since contact)

- Last contact date

**What to do:**

- Prioritize these students at the top of your week

- For flagged students: review why they were flagged and take
  appropriate action

- For long-inactive students: attempt contact, consider whether
  engagement is still active

- If situation resolved: clear the needs_attention flag

**Part III --- Running the Review**

**3.1 Step-by-Step \[WHEN BUILT\]**

1.  Open the BCC Dashboard at your domain

2.  The Weekly Review screen loads automatically as the home screen

3.  Review New Students section first --- quick verification, no deep
    work

4.  Move to Needs Attention --- prioritize your week around these
    students

5.  Work through Ball Check --- make decisions on each student (monitor
    / reach out / schedule)

6.  For any student requiring action: click their name to open the
    student detail page

7.  From student detail: add a note, create a task, or draft a
    communication

8.  Return to weekly review when done with each student

9.  When all three sections are addressed, the weekly review is complete

**3.2 Current Manual Process \[CURRENT\]**

Until the dashboard is built, the weekly review happens manually:

10. Open CPP and review all active students

11. Check Apple Notes for recent meeting notes

12. Cross-reference Google Drive student folders for pending items

13. Check Gmail for recent outbound communications

14. Build a mental or written priority list for the week

This process takes 30-60 minutes and relies on the advisor\'s memory to
catch everything. The dashboard replaces this with a 10-20 minute
structured review driven by data.

**3.3 Decisions Made During the Review**

The weekly review produces a short list of decisions. These get executed
during the week:

- Students to contact this week (and why)

- Meetings to schedule

- Tasks to assign or follow up on

- Students to flag for closer attention

- Students to unflag (situation resolved)

**Part IV --- Maintaining Review Quality**

**4.1 Keeping Notes Current**

The Ball Check and Needs Attention sections are only as good as the
notes data. Every meaningful student interaction should result in a note
entry --- meeting, phone call, email, text thread.

Aim to enter notes within 24 hours of any substantive student contact.
Notes entered later become harder to write accurately and lose their
value for AI extraction.

**4.2 When Students Disappear From the Review**

A student disappears from Ball Check when a note is entered for them
within 14 days. This is the intended behavior. If a student should still
be monitored closely, flag them manually (needs_attention = true) so
they stay visible.

**4.3 Adjusting Thresholds**

The 14-day Ball Check and 21-day Needs Attention thresholds are
defaults. If your practice has a different natural rhythm, these can be
adjusted in the weekly review query. This requires a code change --- ask
Claude to help update the query.

**4.4 Summer and Off-Season**

During summer months and low-activity periods, the review rhythm may
change. The thresholds can be temporarily loosened (21 days for Ball
Check, 30 days for Needs Attention) to reflect the natural slower pace.
Reset in August as the application cycle begins.

**Part V --- Integration with CPP**

**5.1 CPP Remains the College List Master**

The weekly review dashboard shows student phase, mode, and contact
history. It does not show college lists --- those remain in CPP where
students access them directly.

When the college list is relevant to a weekly review decision (e.g. a
student needs to add safety schools), navigate to CPP to review and
update the list. Then return to the dashboard to log the outcome as a
note.

**5.2 Meeting Records**

CPP tracks scheduled meetings (appointments). The BCC Dashboard tracks
meeting notes (content). These are complementary --- CPP tells you when
you met, the dashboard tells you what happened.

After a meeting recorded in CPP, enter the meeting notes in the BCC
Dashboard. This creates the data trail that feeds the Ball Check,
extraction, and AI drafting.

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
