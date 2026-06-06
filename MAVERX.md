# Maverx Training Builder

Turn a one-sentence idea into a **complete, editable PowerPoint training in Maverx
house style** — with speaker notes on every slide and pre-/post-bite handouts —
through a short guided intake. The human stays in control of quality: the system
asks before it generates and refuses until the intake is complete.

> Built for the Maverx challenge (Tier 1). Output is real, editable `.pptx` cloned
> from the provided master slides — not screenshots, not recreated layouts.

## How it works (pipeline)

```
chat intake (5 required Qs, follow-ups, refuse-until-complete)
        │   src/app/api/maverx-chat/route.ts
        ▼
structured training plan  ── LLM (generateObject) ──▶ Zod-validated
        │   src/lib/maverx/{schema,generate-content}.ts
        ▼
editable .pptx  ── pptx-automizer clones the master layouts ──▶ house style preserved
        │   src/lib/maverx/{build-pptx,layout-map}.ts
        │   + 5-field speaker notes injected per slide
        │   src/lib/maverx/add-notes.ts
        ▼
pre-bite + post-bite .docx   src/lib/maverx/build-bites.ts
        ▼
download card in chat        src/components/chat/generative/training-ready-card.tsx
```

Why this design: ~50% of the challenge score is **structural logic + output
editability**, so the deck is built by *cloning the real master slides* (fonts,
colors, logo, layouts come along untouched) and filling their placeholders with
editable text — never by redrawing slides.

## Setup (≈2 minutes)

```bash
pnpm install
cp .env.example .env            # add an API key (see below)
pnpm db:push                    # SQLite (used by the scaffold; harmless here)
```

**Drop the Maverx-provided assets into `assets/maverx/`:**

| File | Save as | Why |
|---|---|---|
| Master slides (.pptx) | `assets/maverx/master.pptx` | **Required** — slides are cloned from this |
| Style guide (PDF) | `assets/maverx/style-guide.pdf` | reference only |
| Example training (.docx) | `assets/maverx/example.docx` | reference only |

**API key** — pick one in `.env`:

```bash
# Option A — Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Option B — OpenRouter (the €20 credits Maverx provides)
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=anthropic/claude-sonnet-4.6        # any OpenRouter model id

# Optional: a stronger model just for content generation
AI_CONTENT_MODEL=claude-opus-4-8
```

## Map the master layouts (one-time, after dropping master.pptx)

The engine needs to know which master slide to clone for each kind of slide and the
shape names to fill. Discover them:

```bash
pnpm inspect:master
```

This prints every master slide with its layout name and shape names. Put those into
**`src/lib/maverx/layout-map.ts`** — pick the slide whose layout best fits each block
(`kickoff / theory / example / exercise / wrapup`, plus `title` and `agenda`) and set
the `titleShape` / `bodyShape` (and `tableShape` where present) to the real names.

> Speaker notes: if `pnpm inspect:master` shows the master has no notes master, open
> `master.pptx` in PowerPoint once, add a line of Speaker Notes to any slide, and save.
> That creates the notes infrastructure the generator reuses. (The engine tells you
> this too, rather than producing a file that won't open.)

## Run

```bash
pnpm dev          # http://localhost:3000/maverx
```

Describe a training in the chat (e.g. *"a 3-hour Prompt Engineering training for the
marketing team, no prior AI experience"*). Answer the intake questions; when complete,
the deck + pre/post-bite appear as download links.

Prefer an API? `POST /api/generate-training` with JSON:

```bash
curl -X POST localhost:3000/api/generate-training -H 'content-type: application/json' \
  -d '{"topic":"Prompt Engineering","audience":"Marketing team","level":"beginner","durationMinutes":180,"objective":"Write effective prompts for daily marketing tasks"}'
```

## Swapping the house style (for a different client)

The system is not hard-coded to Maverx:

1. Replace `assets/maverx/master.pptx` with the new template.
2. Run `pnpm inspect:master` and update `src/lib/maverx/layout-map.ts` with the new
   slide numbers + shape names.

No other code changes — content generation and notes injection are template-agnostic.

## Key files

| Path | Responsibility |
|---|---|
| `src/lib/maverx/schema.ts` | Intake + training-plan types; didactic blocks; 5-field notes |
| `src/lib/maverx/generate-content.ts` | LLM → validated structured plan |
| `src/lib/maverx/build-pptx.ts` | Clone master layouts, fill placeholders/tables |
| `src/lib/maverx/layout-map.ts` | Master slide # + shape names per block (the one thing to tune) |
| `src/lib/maverx/add-notes.ts` | Inject 5-field speaker notes into every slide |
| `src/lib/maverx/build-bites.ts` | Pre-bite / post-bite `.docx` |
| `src/lib/maverx/pipeline.ts` | Orchestrates the above, writes downloadable files |
| `src/app/api/maverx-chat/route.ts` | Intake chat + `generateTraining` tool |
| `src/app/maverx/page.tsx` | The product page |
| `scripts/inspect-master.ts` | Print master slide/shape names |

Stack: Next.js 15, AI SDK v6, `pptx-automizer` (template-preserving PPTX), `docx`.
