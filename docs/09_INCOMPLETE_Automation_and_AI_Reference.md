**BCC Dashboard --- Automation and AI Reference**

Version 0.1 --- May 2026

*Extraction pipeline, prompt patterns, and abstraction layer ---
INCOMPLETE Placeholder*

+-----------------------------------------------------------------------+
| **INCOMPLETE DOCUMENT**                                               |
|                                                                       |
| This document is a placeholder. Content will be written when the      |
| relevant system phase is built. The structure and section headings    |
| are intentional --- they define what will be here. The details are    |
| not yet written.                                                      |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  *This document will be written as the AI pipeline is built in Phases 4
  and 5. The section structure below defines what will be here. The
  Architecture Reference (Document 04, Part V) contains the current
  conceptual overview.*

  -----------------------------------------------------------------------

**Document Purpose**

This document is the technical reference for all automation and AI
features in the BCC Dashboard. It covers: how the extraction pipeline
works in implementation detail, prompt templates with rationale, the
abstraction layer interfaces, error handling patterns, testing
approaches for AI features, and the Zoom AI ingestion pipeline.

**Part I --- Extraction Pipeline**

**1.1 Full Pipeline Walkthrough**

CONTENT TO BE WRITTEN --- Step-by-step with actual code from the
implementation.

**1.2 The Extraction Prompt**

CONTENT TO BE WRITTEN --- Full prompt template, field-by-field
rationale, BCC Syntax handling instructions, JSON schema definition.

**1.3 Parsing the Response**

CONTENT TO BE WRITTEN --- How structured_output JSON is parsed into
proposed extract rows.

**1.4 Error Handling**

CONTENT TO BE WRITTEN --- What happens when extraction fails, how errors
surface to the advisor, retry logic.

**1.5 Extraction Quality**

CONTENT TO BE WRITTEN --- How to evaluate extraction quality, confidence
score interpretation, when to re-extract.

**Part II --- Email Drafting Pipeline**

**2.1 Full Drafting Walkthrough**

CONTENT TO BE WRITTEN --- Step-by-step with actual code.

**2.2 The Drafting Prompt**

CONTENT TO BE WRITTEN --- Full prompt template, how student extracts are
injected, tone and voice instructions, length guidance.

**2.3 The Approval Queue**

CONTENT TO BE WRITTEN --- How drafts move from AI output to advisor
review to sent communication.

**Part III --- The AI Abstraction Layer**

**3.1 lib/ai/extract.ts Interface**

CONTENT TO BE WRITTEN --- Function signatures, parameters, return types,
error types.

**3.2 lib/ai/draft.ts Interface**

CONTENT TO BE WRITTEN --- Function signatures, parameters, return types,
error types.

**3.3 Swapping the AI Provider**

CONTENT TO BE WRITTEN --- Step-by-step instructions for replacing Claude
with another model. What changes, what does not.

**Part IV --- Zoom AI Ingestion**

**4.1 Current Manual Process**

CONTENT TO BE WRITTEN --- How Zoom AI summaries are currently handled
manually.

**4.2 Automated Ingestion Pipeline**

CONTENT TO BE WRITTEN --- The email forwarding pipeline design. Zoom AI
→ Gmail → parsing → notes table. Will reference original Appendix A
design.

**Part V --- Prompt Library**

CONTENT TO BE WRITTEN --- All production prompts with version history
and rationale. This section grows as new AI features are added.

*BCC Dashboard --- Bell College Consulting*

*Built with Claude (Sonnet 4.6) --- Cursor --- Next.js --- Supabase ---
Postgres*

*MIT License --- Built to be given away*
