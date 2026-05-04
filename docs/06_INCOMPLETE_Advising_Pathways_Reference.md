**BCC Dashboard --- Advising Pathways Reference**

Version 0.1 --- May 2026

*INCOMPLETE --- Placeholder Document*

+-----------------------------------------------------------------------+
| **INCOMPLETE DOCUMENT**                                               |
|                                                                       |
| This document is a placeholder. Content will be written when the      |
| relevant system phase is built. The structure and section headings    |
| are intentional --- they define what will be here. The details are    |
| not yet written.                                                      |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  *This document will be written when Pathways are implemented in Phase
  3+. The section structure below defines what will be here. Until then,
  refer to the original Appendix L (Advising Pathways Technical
  Reference) from the legacy documentation set for the conceptual
  design.*

  -----------------------------------------------------------------------

**Document Purpose**

This document defines every Advising Pathway in the BCC Dashboard
system. For each pathway it describes: the domain it covers, its Brains
(logic rules), its Rails (timing mechanisms), its Effects (outputs it
produces), and its cross-pathway dependencies.

Pathways are the intelligence layer of the advising engine. They
translate the system\'s understanding of a student into concrete actions
--- tasks, communications, milestones, and flags.

**Part I --- Pathway Framework Overview**

**1.1 What a Pathway Is**

CONTENT TO BE WRITTEN --- Will explain the Brains / Rails / Effects
architecture and how pathways interact with the Rule Engine, Temporal
Anchors, and AdvisingItems queue.

**1.2 Pathway Activation**

CONTENT TO BE WRITTEN --- Will explain how pathways are assigned to
students via student_pathways join table, activation and deactivation
conditions, and the difference between core and optional pathways.

**1.3 Cross-Pathway Gates**

CONTENT TO BE WRITTEN --- Will explain how gates enforce sequencing
between pathways (e.g. Financial Discussion must be complete before List
Building begins).

**Part II --- Core Pathways**

**Process Pathway**

CONTENT TO BE WRITTEN --- The primary sequential pathway. Drives
students through PRE → YOU → FIT → APP → POST phases. Owns the main
advising arc.

**Calendar Pathway**

CONTENT TO BE WRITTEN --- Date-driven pathway. Manages all
deadline-relative logic. Works alongside Process Pathway.

**Academic Pathway**

CONTENT TO BE WRITTEN --- Covers course selection, GPA, rigor, and
testing strategy.

**Financial Pathway**

CONTENT TO BE WRITTEN --- Covers affordability conversations, financial
aid planning, and budget alignment with college list.

**Talent Pathway**

CONTENT TO BE WRITTEN --- Covers athletics, arts, research, leadership,
and other distinguishing talent profiles.

**Developmental Pathway**

CONTENT TO BE WRITTEN --- Covers identity exploration, maturity, and
wellbeing as relevant to the advising relationship.

**Part III --- Optional Pathways**

**Neurodiversity Pathway**

CONTENT TO BE WRITTEN

**Athletics Pathway**

CONTENT TO BE WRITTEN

**Arts Pathway**

CONTENT TO BE WRITTEN

**First-Generation Pathway**

CONTENT TO BE WRITTEN

**Transfer Pathway**

CONTENT TO BE WRITTEN

**Part IV --- Pathway Data Model**

**pathways Table**

CONTENT TO BE WRITTEN --- Field definitions when migration is written.

**student_pathways Join Table**

CONTENT TO BE WRITTEN --- Field definitions when migration is written.

**advising_rules Table**

CONTENT TO BE WRITTEN --- Rule schema, condition format, trigger format,
effect format.

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
