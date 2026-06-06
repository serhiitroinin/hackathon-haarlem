# Training Framework — the didactic engine

> How the system turns **5 intake answers** into a **teachable training plan**.
> Design principle: **structure is computed, content is generated.** The LLM never
> decides how many modules or how long the kick-off is — it fills text into a fixed
> scaffold. This is what makes us a *structured production assistant*, not a slide
> generator, and it's what the rubric rewards (Structural Logic = 35%).

---

## 0. The pipeline at a glance

```
Intake (5 answers + optional source docs)
  ↓  ── deterministic ──
Training Budget        (duration → modules, slides, timing, breaks)
  ↓  ── LLM, grounded ──
Outline                (Kick-off → N×Module → Wrap-up, each slot named)
  ↓  ── trainer confirms (per the brief: "this is my proposal, agree or adjust?") ──
Approved Outline
  ↓  ── LLM, chunk by chunk ──
Slide content  +  5-field speaker notes  +  Pre-bite  +  Post-bite
  ↓  ── deterministic ──
.pptx on master layouts  +  2 side docs
```

Stages 1 and 5 are **code, not prompts**. Only stages 2–4 call the model.

---

## 1. Intake → Training Budget  *(deterministic — no LLM)*

The 5 required answers are: **topic · audience · level · duration · objective.**
From `duration` and `level` we compute everything structural:

### 1a. Time allocation
Split the clock before writing any content:

| Block | Share of total | Floor | Notes |
|---|---|---|---|
| Kick-off | 8% | 10 min | Title, agenda, objectives, "why this matters" hook |
| Content (modules) | ~70% | — | The Theory→Example→Exercise loops |
| Breaks | — | 10 min per 90 min | Adult attention span; never skip on 2h+ |
| Wrap-up | 7% | 10 min | Takeaways, link to practice, next steps |

`content_time = total − kickoff − wrapup − breaks`

### 1b. Module count
A **module** = one Theory→Example→Exercise loop ≈ **25–40 min**.

```
modules = round( content_time / minutes_per_module )
minutes_per_module:  beginner ≈ 40   intermediate ≈ 32   advanced ≈ 26
```
Beginner → fewer, bigger, slower modules. Advanced → more, denser modules.
Clamp to `[1, 8]` for a single Tier-1 deck.

### 1c. Slide count & pacing
Pacing constants (adult-learning rules of thumb):

| Slide type | Minutes | Slides per module |
|---|---|---|
| Theory | ~2 min | 1–3 (scale with level) |
| Example | ~3 min | 1 |
| Exercise | 10–20 min | 1 (the work happens off-slide) |

```
slides ≈ kickoff(4) + Σ module(theory 1–3 + example 1 + exercise 1) + wrapup(3)
```
A 3-hour beginner training lands around **20–28 slides** — which matches the brief's
"~20 slides" and keeps slides from becoming walls of text.

> **Why compute, not ask:** timing is a judging criterion ("is timing distributed
> sensibly?"). If the model invents "15 min" per slide, a 3h training has 12 slides or
> 200 — neither teachable. Compute it once, then *tell* the model the budget per slot.

---

## 2. The structural model — recursion is the trick

The didactic arc exists at **two levels**:

```
TRAINING  =  Kick-off  +  [ Module ₁ … Module ₙ ]  +  Wrap-up
MODULE    =  Theory(1–3)  +  Example(1)  +  Exercise(1)
```

The brief lists Kick-off → Theory → Example → Exercise → Wrap-up as one line, but a
real 3-hour training is **not** one example and one exercise — it's the middle loop
repeated per concept. Modeling the Module as the repeating unit is what lets the same
engine produce a 20-slide Tier-1 deck or an 8-session Tier-3 track (a session = a
Training; a track = an ordered list of Trainings sharing one case).

### Block roles (fixed — every training, no exceptions)
| Block | Job | Lands as |
|---|---|---|
| **Kick-off** | Orient & motivate | Title · Agenda · Learning objectives · "Why this matters" hook |
| **Theory** | Teach one concept | Definition · key components · how it works |
| **Example** | Make it concrete | One recognizable worked illustration / mini-case |
| **Exercise** | Active application | Instructions: format (solo/pair/group), time, deliverable |
| **Wrap-up** | Consolidate & bridge | Key takeaways · link to practice · next steps · post-bite pointer |

---

## 3. Slide blueprints — fixed slot per block type

Each block type maps to a **named master layout** and a **content shape**. The LLM
receives the shape and fills it; it cannot invent new layouts. This is what holds
House Style Compliance (20%) and Editability (30%) together.

| Block | Master layout | Content shape (what the LLM fills) |
|---|---|---|
| Title | Title slide | training title, subtitle (audience + duration) |
| Agenda | Section/list | the module names, in order |
| Objectives | Bulleted | 3–5 outcome statements ("After this you can…") |
| Theory | Title + body | 1 concept; ≤5 bullets OR a 2-col table; no paragraphs |
| Example | Title + body | 1 scenario, named & specific to the audience's world |
| Exercise | Title + body | task · format · time · what to hand in · success criteria |
| Wrap-up | Bulleted | 3 takeaways tied back to the objectives |

**Content rules** (enforced, not suggested): editable text/tables only, never images
of text; ≤6 bullets/slide; ≤12 words/bullet; one idea per slide.

---

## 4. Speaker notes — the 5 fields, per slide

Required on **every** slide. Four are generated; **Time is computed** from §1.

| Field | Source | Example |
|---|---|---|
| **Aim** | LLM, 1 sentence | "Land the difference between a goal and a wish." |
| **Time** | **computed** from budget | "4 min" |
| **Instructions** | LLM, trainer-ready steps | "Ask the room… then reveal… then…" |
| **Reflective question** | LLM, for learners | "When did a vague goal cost you?" |
| **Debrief** | LLM, 1 punchy line | "Specific beats ambitious — every time." |

Computing Time from the budget is what makes the per-slide minutes sum back to the
requested duration. That's the single highest-leverage detail for Structural Logic.

---

## 5. Pre-bite & Post-bite  *(separate editable files)*

Derived from the objective and the exercises — not free-form.

- **Pre-bite** (before): exactly one of → an article to read · software to install ·
  a reflection question. Chosen by topic type (tool-based → install; concept → read/reflect).
- **Post-bite** (after): a reflection question + a small application assignment that
  reuses the session's exercise in the learner's real context.

For Tier 3, the **post-bite of session N seeds the pre-bite of session N+1** — that's
the "red thread" requirement, and it falls out naturally because both reference the
same running case.

---

## 6. Grounding & reliability — the anti-hallucination spine

Optional source docs (e.g. the Movisie *methodieken* in `social-work-sources.md`) feed
the outline stage. A phased method maps **one phase → one module**:

```
Oplossingsgericht werken  →  4 phases  →  4 Theory modules
  Perceptieonderzoek · Doelformulering (wondervraag) · Uitzonderingen/schaalvraag · Volgende stap
```

This gives two things the rubric asks for:
1. **Structural logic for free** — the source's own phase order *is* a sound sequence.
2. **A reliability score per slide** — slides built from extracted source text score
   *high*; slides the model invented (e.g. an example with no source anchor) are
   *flagged* so the trainer knows where to review. (Recall the failure mode from
   `social-work-sources.md`: a fast summarizer wrongly claimed "Krachtwerk = intellectual
   disabilities." Grounding is what prevents shipping that with false confidence.)

---

## 7. Why this scaffold also wins the non-obvious points

| Rubric line | How the framework earns it |
|---|---|
| Structural Logic (35%) | Arc is structural, not prompted; timing computed; exercises paired to each theory module by construction |
| Output Editability (30%) | Content shapes forbid images-of-text; fixed layouts keep python-pptx deterministic |
| House Style (20%) | LLM never picks a layout — it fills named master slots |
| Intake Quality (15%) | Budget can't be computed until all 5 answers exist → the system *structurally* refuses to generate when intake is incomplete |
| Cost (bonus) | Only stages 2–4 hit the model; structure is free; grounded prompts are shorter |
| Bilingual (bonus) | Content slots are language-agnostic; generate the scaffold once, fill per language |

---

## 8. Open knobs (tune during build)
- Exact % splits and `minutes_per_module` constants — calibrate against the example `.docx`.
- Theory slides per module by level (1 / 2 / 3) — calibrate against real Maverx decks.
- Reliability score: start binary (grounded vs invented), refine to a 0–1 coverage ratio.
