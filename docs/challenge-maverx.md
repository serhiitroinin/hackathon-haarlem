# CHOSEN CHALLENGE — Maverx: AI-Powered Training Builder

> One sentence → a complete, **editable PowerPoint deck in Maverx house style** in <10 min.
> A structured production assistant that follows a fixed didactic model and keeps the human in control.

## Provided assets (MUST use — in the challenge Google Drive folder)
- **Style Guide (PDF)** — colors, fonts, logos.
- **Master slides (.pptx)** — all layouts in house style. **Reference these, do NOT recreate.**
- **Example training (.docx)** — structure of a real Maverx training.
- **€20 OpenRouter API credits** per team (ask the Maverx team for the key).

## Hard requirements
**Intake** — ask at least these 5 before generating; ask follow-ups on vague input; **refuse to generate until complete**:
1. Topic/skill to train · 2. Target audience · 3. Knowledge level (beg/int/adv) · 4. Training length · 5. Primary learning objective.

**Didactic model (every training, no exceptions):** Kick-off → Theory → Example → Exercise → Wrap-up.

**Output:**
- `.pptx`, fully editable in PowerPoint, built on the master layouts (editable text/tables, **no flattened images/screenshots**).
- **Speaker notes on every slide**, all 5 fields: 1) aim of slide, 2) time indication, 3) instruction steps, 4) reflective question, 5) debrief summary.
- **Pre-bite** (prep doc before session) + **Post-bite** (follow-up doc after) as separate editable files.

## Tiers (pick ambition; *polished Tier 1 beats broken Tier 3*)
- **Tier 1** — one complete training (~20–30 slides). ← **our target**
- Tier 2 — 3-level track (Essentials/Advanced/Expert) + Mentimeter recaps.
- Tier 3 — full certification programme, consistent fictional case across sessions (token-heavy).

## Judging (the rubric that should drive every decision)
**Out of 100:** Challenge-specific 60 · Execution quality 30 · Innovation 10.

Challenge-specific (60) / per-deliverable weighting:
| Criterion | Weight | What matters |
|---|---|---|
| **Structural Logic** | 21 / 35% | Didactic arc present; exercises matched to theory; speaker notes complete; sensible timing; *a trainer could actually teach from it*. |
| **Output Editability** | 18 / 30% | Opens clean (no repair prompt); all editable text/tables; handles edge cases. **The make-or-break technical risk.** |
| **House Style Compliance** | 12 / 20% | Master slides referenced not redrawn; fonts/colors/logo intact; layout discipline. |
| **Intake Quality** | 9 / 15% | 5 Qs asked; vague input → follow-ups; refuses until complete. |

Execution (30): UX 8 · Docs 6 · Polish 5 · Setup/Onboarding 4 · Reproducibility 4 · Deployment readiness 3.
Innovation (10): value-adding creativity, not novelty for its own sake.

> **Read of the rubric:** ~50% of the score is *structure + editability* — a `python-pptx`-from-template engineering problem, NOT web/demo polish (UX is only 8 pts). Win by making the deck correct, editable, and on-brand — then add one clever innovation.

## Submission checklist
.pptx opens with no repair · all editable text/tables · master slides referenced · fonts/colors/logo match · full didactic arc · speaker notes (5 fields) every slide · pre+post-bite as separate files · intake asks 5 Qs + handles vague + refuses until complete · README + run instructions · deps/API keys documented · style-guide swap path documented.
