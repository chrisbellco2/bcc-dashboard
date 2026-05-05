# BCC Dashboard — Weekly Review Playbook

Version 2.0 — May 2026

_How to run the Monday morning student review_

_This playbook describes the intended weekly review process. Some features referenced (notes entry, extraction, task management) are being built now. Steps marked [CURRENT] reflect how things work today. Steps marked [WHEN BUILT] reflect the intended workflow once features are complete._

---

# Part I — What the Weekly Review Is

## 1.1 Purpose

The weekly review is the advisor's primary rhythm tool. It answers two questions every week without having to mentally stitch together information from multiple systems:

| Question | What It Tells You | Action It Drives |
|---|---|---|
| Do I have something to do for this student? | Whether the advisor has an open action | Work through advisor actions before they age |
| Does the student have something to do? | Whether the student is actively working on something | Follow up if student actions are stale |

A third question — who is new this week — completes the picture for onboarding.

The review is designed to take 10-20 minutes on a Monday morning. It is not a deep dive into individual students — it is a triage and prioritization exercise. Individual student work happens in student detail pages.

## 1.2 When to Run It

Monday morning, before client communications begin. The review sets the advisor's priority list for the week.

A lighter version can be run mid-week (Wednesday) to check on anything that needs follow-up from Monday decisions.

## 1.3 Who Runs It

Chris runs the review independently. The dashboard shows all students regardless of lead advisor, with filtering available by advisor name. Other advisors (Gav, Mark, Laura, Esther) can run the same review filtered to their own students.

---

# Part II — The Dashboard Sections

The weekly review dashboard has five sections. A student's section placement is determined entirely by two fields: `advisor_action` and `student_action`. Both are simple text fields — null means no action, any text means an action exists.

## 2.1 Both Active

Students where both `advisor_action` and `student_action` have a value. Both sides are moving simultaneously.

**What you see:**
- Student name, graduation year, phase, lead advisor
- Advisor action pill (blue) — what the advisor needs to do
- Student action pill (amber) — what the student needs to do

**What to do:**
- Verify the advisor action is still accurate and not stale
- Confirm the student action is something the student actually knows about
- These students are in healthy motion — your job is to keep both sides moving

## 2.2 Needs Attention

Students where both `advisor_action` and `student_action` are null AND either 21+ days have passed since last contact OR `needs_attention` has been manually flagged. These are the highest priority students — something has gone quiet.

**What you see:**
- Student name, graduation year, phase, lead advisor
- Why they appear: days since last contact, or manually flagged
- Both action pills muted (no active actions)

**What to do:**
- Prioritize these students at the top of your week
- For flagged students: review why they were flagged and take appropriate action
- For long-inactive students: attempt contact, consider whether engagement is still active
- When action is established, add an advisor_action or student_action to move the student out of this section

## 2.3 Advisor Has Action

Students where `advisor_action` has a value and `student_action` is null. The advisor needs to do something — the student is waiting.

**What you see:**
- Student name, graduation year, phase, lead advisor
- Advisor action pill (blue) — the specific action
- Student action pill muted

**What to do:**
- Work through these students during the week
- When the action is complete, clear the advisor_action field
- If the action produces something for the student to do next, set student_action at the same time

## 2.4 Student Has Action

Students where `student_action` has a value and `advisor_action` is null. The student is working on something — the advisor is monitoring.

**What you see:**
- Student name, graduation year, phase, lead advisor
- Advisor action pill muted
- Student action pill (amber) — what the student is working on

**What to do:**
- These students are largely self-directed — light monitoring
- If the student action appears stale (set weeks ago with no follow-up note), reach out
- When the student completes their action, clear student_action and set advisor_action if a review step is needed

## 2.5 All Students

Complete list of all active students with both action pills visible. Used for reference and for students not appearing in any of the above sections (both null, not yet inactive enough for Needs Attention).

---

# Part III — The Action Fields

## 3.1 What Goes in an Action Field

Action fields hold a brief description of the current next step — 3 to 8 words. They are not task lists. They describe the single most important thing that needs to happen next on each side.

Good examples:
- `Review college list draft`
- `Send check-in email`
- `Complete activity list`
- `Draft Common App essay`
- `Schedule next meeting`

Bad examples:
- `Various things to follow up on` — too vague
- `Review college list, send email, update phase, check test scores` — too many things
- `TBD` — not actionable

## 3.2 Keeping Actions Current

Action fields should reflect reality at all times. After every meaningful student interaction:
- Update or clear the advisor_action if the advisor's task changed or was completed
- Update or clear the student_action if the student's task changed or was completed
- Set new actions as they emerge from the meeting

In the future, AI extraction will read meeting notes and suggest updates to both action fields. For now, these are set manually.

## 3.3 The Relationship to assigned_tasks

`advisor_action` and `student_action` on the students table are lightweight surface fields — they show the most important current action for each side at a glance on the dashboard.

The `assigned_tasks` tall table is where the full task history lives — every task ever created, its status, its source, its completion date. The action fields and the tasks table are complementary:

- Action fields: what matters right now, visible on the dashboard
- assigned_tasks: the complete task history, visible on the student detail page

Eventually, action fields will be derived from or synced with open tasks in the assigned_tasks table. For now they are set independently.

---

# Part IV — Running the Review

## 4.1 Step-by-Step [WHEN BUILT]

1. Open the BCC Dashboard at your domain
2. The Weekly Review screen loads automatically as the home screen
3. Review Both Active section — confirm both sides are actually moving
4. Review Needs Attention — these are your top priorities for the week
5. Work through Advisor Has Action — these are your commitments to students
6. Scan Student Has Action — check for anything that has gone stale
7. For any student requiring action: click their name to open the student detail page
8. From student detail: add a note, update action fields, create a task, or draft a communication
9. When all sections are addressed, the weekly review is complete

## 4.2 Current Manual Process [CURRENT]

Until the full dashboard is built, the weekly review happens manually:

1. Open CPP and review all active students
2. Check Apple Notes for recent meeting notes
3. Cross-reference Google Drive student folders for pending items
4. Check Gmail for recent outbound communications
5. Build a mental or written priority list for the week

This process takes 30-60 minutes and relies on the advisor's memory to catch everything. The dashboard replaces this with a 10-20 minute structured review driven by data.

## 4.3 Decisions Made During the Review

The weekly review produces a short list of decisions. These get executed during the week:

- Students to contact this week (and why)
- Meetings to schedule
- Actions to update, complete, or create
- Students to flag for closer attention
- Students to unflag (situation resolved)

---

# Part V — Maintaining Review Quality

## 5.1 Keeping Notes Current

The Needs Attention section is only as good as the notes data. Every meaningful student interaction should result in a note entry — meeting, phone call, email, text thread.

Aim to enter notes within 24 hours of any substantive student contact. Notes entered later become harder to write accurately and lose their value for AI extraction.

## 5.2 Keeping Action Fields Current

The dashboard sections are only as good as the action fields. An action field that hasn't been updated in three weeks is no longer telling the truth. During the weekly review, treat stale actions as a signal to investigate — either complete them, update them, or clear them.

## 5.3 Adjusting Thresholds

The 21-day Needs Attention threshold is a default. If your practice has a different natural rhythm, this can be adjusted in the weekly review query. This requires a code change — ask Claude to help update the query.

## 5.4 Summer and Off-Season

During summer months and low-activity periods, the review rhythm may change. The threshold can be temporarily loosened (30 days for Needs Attention) to reflect the natural slower pace. Reset in August as the application cycle begins.

---

# Part VI — Integration with CPP

## 6.1 CPP Remains the College List Master

The weekly review dashboard shows student phase, action status, and contact history. It does not show college lists — those remain in CPP where students access them directly.

When the college list is relevant to a weekly review decision (e.g. a student needs to add safety schools), navigate to CPP to review and update the list. Then return to the dashboard to log the outcome as a note.

## 6.2 Meeting Records

CPP tracks scheduled meetings (appointments). The BCC Dashboard tracks meeting notes (content). These are complementary — CPP tells you when you met, the dashboard tells you what happened.

After a meeting recorded in CPP, enter the meeting notes in the BCC Dashboard. This creates the data trail that feeds Needs Attention detection, AI extraction, and action field suggestions.

---

_BCC Dashboard — Bell College Consulting_
_Built with Claude (Sonnet 4.6) — Cursor — Next.js — Supabase — Postgres_
_MIT License — Built to be given away_
