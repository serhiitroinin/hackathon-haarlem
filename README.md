# Maverx AI Training Builder

Turn a one-sentence idea into a **complete, editable PowerPoint training in Maverx
house style** — speaker notes on every slide, plus pre-bite and post-bite handouts —
in under 10 minutes. A guided intake keeps the human in control of quality: the system
asks targeted questions, handles vague input with follow-ups, and **refuses to generate
until the intake is complete.**

> Submission for the **AI Hackathon Haarlem — Maverx challenge**. The output is real,
> editable `.pptx` **cloned from the provided master slides** (fonts, colors, logo,
> layouts intact) — never screenshots, never recreated layouts.

---

## What it produces

From one chat, you get every deliverable in the brief as separate, editable files:

| Deliverable | Format | How it's made |
|---|---|---|
| **Training deck** following the didactic arc | `.pptx` | Master slides cloned + placeholders filled with editable text/tables |
| **Speaker notes on every slide** (all 5 fields) | in the `.pptx` | Injected into the PowerPoint notes pane per slide |
| **Pre-bite** preparation document | `.docx` | Reading / setup / reflection before the session |
| **Post-bite** follow-up document | `.docx` | Assignment / reflection / further reading after the session |

Speaker-note fields on every slide: **1. Aim · 2. Time indication · 3. Instruction
steps · 4. Reflective question · 5. Debrief summary.**

---

## How the brief maps to the code

A judge can verify each requirement directly:

| Brief requirement | Where it lives |
|---|---|
| Intake asks the **5 required questions**, follow-ups on vague input, **refuses until complete** | `src/app/api/maverx-chat/route.ts` (system prompt + `generateTraining` tool gate); `src/lib/maverx/schema.ts` (`intakeSchema`) |
| Didactic model: **kick-off → theory → example → exercise → wrap-up** | `src/lib/maverx/generate-content.ts` (enforced in the structured-output schema + prompt) |
| **Editable** `.pptx` from the **master slides** (referenced, not redrawn) | `src/lib/maverx/build-pptx.ts` + `layout-map.ts` (clones master layouts via `pptx-automizer`) |
| **5-field speaker notes** on every slide | `src/lib/maverx/add-notes.ts` |
| **Pre-bite / post-bite** documents | `src/lib/maverx/build-bites.ts` |
| House-style compliance (colors/fonts/logo) | preserved automatically by cloning the master; mapping in `layout-map.ts` |

---

## Quick start (3 commands)

**Prerequisites:** Node 20+, [pnpm](https://pnpm.io/), and Docker (for the local
Postgres). An LLM API key (Anthropic, OpenAI, or OpenRouter — see below).

```bash
pnpm install
cp .env.example .env            # add ONE API key (see "API keys" below)
docker compose up -d            # local Postgres matching the .env DATABASE_URL
pnpm db:push                    # create the schema
pnpm dev                        # → http://localhost:3000/maverx
```

### API keys

Pick **one** provider in `.env`:

```bash
# Option A — Anthropic
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-...

# Option B — OpenRouter (the €20 credits Maverx provides per team)
AI_PROVIDER=openrouter
AI_MODEL=anthropic/claude-sonnet-4.6        # any OpenRouter model id
OPENROUTER_API_KEY=sk-or-...

# Optional — a stronger model just for content generation
AI_CONTENT_MODEL=claude-opus-4-8
```

That's the only required configuration. `DATABASE_URL` already points at the local
Docker Postgres; maps and theming have working defaults.

---

## Add the house style (the one setup step that matters)

The `.pptx` is built by **cloning the real Maverx master slides**, so the house style
comes along untouched. Two steps:

**1. Drop the provided assets** into `assets/maverx/` (from the challenge Google Drive,
exact filenames — these are git-ignored as client material):

| Provided file | Save as | Role |
|---|---|---|
| Master slides (.pptx) | `assets/maverx/master.pptx` | **Required** — every slide is cloned from this |
| Style guide (PDF) | `assets/maverx/style-guide.pdf` | reference only |
| Example training (.docx) | `assets/maverx/example.docx` | reference only |

**2. Map the layouts** so the engine knows which master slide to clone for each block:

```bash
pnpm inspect:master      # prints every master slide + its shape names
```

Put those numbers and shape names into **`src/lib/maverx/layout-map.ts`** — match each
didactic block (`kickoff / theory / example / exercise / wrapup`, plus `title` and
`agenda`) to the master slide whose layout fits, and set `titleShape` / `bodyShape`
(and `tableShape` where present) to the real shape names.

> **Notes master:** if `inspect:master` reports the master has no notes master, open
> `master.pptx` in PowerPoint once, add a line of Speaker Notes to any slide, and save.
> That creates the notes infrastructure the generator reuses. (The engine surfaces this
> as a clear error rather than emitting a file that won't open.)

---

## How to use

**Chat (recommended):** go to `http://localhost:3000/maverx` and describe a training,
e.g. *"a 3-hour Prompt Engineering training for the marketing team, no prior AI
experience."* Answer the intake questions; when the intake is complete the deck +
pre/post-bite appear as download links.

**API:** `POST /api/generate-training` with JSON intake:

```bash
curl -X POST localhost:3000/api/generate-training -H 'content-type: application/json' \
  -d '{"topic":"Prompt Engineering","audience":"Marketing team","level":"beginner","durationMinutes":180,"objective":"Write effective prompts for daily marketing tasks"}'
```

Both return links to the generated `.pptx` and two `.docx` files under
`public/generated/<id>/`.

---

## How it works

```
chat intake ── 5 required Qs · follow-ups on vague input · refuse-until-complete
     │  src/app/api/maverx-chat/route.ts
     ▼
structured training plan ── LLM (generateObject) ──▶ Zod-validated, didactic arc enforced
     │  src/lib/maverx/{schema,generate-content}.ts
     ▼
editable .pptx ── pptx-automizer clones master layouts ──▶ house style preserved
     │  src/lib/maverx/{build-pptx,layout-map}.ts
     │  + 5-field speaker notes injected per slide  ──▶ src/lib/maverx/add-notes.ts
     ▼
pre-bite + post-bite .docx ──▶ src/lib/maverx/build-bites.ts
     ▼
download card in chat ──▶ src/components/chat/generative/training-ready-card.tsx
```

`src/lib/maverx/pipeline.ts` orchestrates the steps and writes the downloadable files.
The design choice that drives the score: ~half the challenge points are **structural
logic + output editability**, so the deck is assembled by *filling the placeholders of
cloned master slides with editable text* — never by redrawing slides as images.

### Key files

| Path | Responsibility |
|---|---|
| `src/lib/maverx/schema.ts` | Intake + training-plan types; didactic blocks; 5-field notes |
| `src/lib/maverx/generate-content.ts` | LLM → validated structured plan |
| `src/lib/maverx/build-pptx.ts` | Clone master layouts, fill placeholders/tables |
| `src/lib/maverx/layout-map.ts` | Master slide # + shape names per block — **the one thing to tune** |
| `src/lib/maverx/add-notes.ts` | Inject 5-field speaker notes into every slide |
| `src/lib/maverx/build-bites.ts` | Pre-bite / post-bite `.docx` |
| `src/lib/maverx/pipeline.ts` | Orchestrates the above; writes downloadable files |
| `src/app/api/maverx-chat/route.ts` | Intake chat + `generateTraining` tool |
| `src/app/maverx/page.tsx` | The product page |
| `scripts/inspect-master.ts` | Print master slide / shape names |

---

## Swapping the house style (any client, not just Maverx)

The system is not hard-coded to Maverx:

1. Replace `assets/maverx/master.pptx` with the new template.
2. Run `pnpm inspect:master` and update `src/lib/maverx/layout-map.ts` with the new
   slide numbers + shape names.

No other code changes — content generation and notes injection are template-agnostic.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| AI | Vercel AI SDK v6 — streaming chat + structured generation; Anthropic / OpenAI / OpenRouter |
| PPTX | `pptx-automizer` (template-preserving clone) + `@xmldom/xmldom` / `jszip` for notes |
| Documents | `docx` (pre/post-bite) |
| API / data | tRPC v11, Prisma 6 + Postgres, Zod |
| UI | shadcn/ui + Tailwind v4, Motion |

---

## Commands

| | |
|---|---|
| `pnpm dev` | dev server (Turbopack) → `/maverx` |
| `pnpm inspect:master` | print master slide / shape names for `layout-map.ts` |
| `pnpm db:push` | sync schema → Postgres (no migration files) |
| `pnpm db:studio` | Prisma Studio (browse data) |
| `pnpm typecheck` | full TS check |
| `pnpm build` | production build |

---

## Deployment

Live deploy is pre-wired for **Fly.io** (Dockerfile + `fly.toml`, schema synced on each
release via `release_command = "pnpm db:push"`). Push to `main` auto-deploys via CI.
Full runbook, secrets, and teardown in **[DEPLOY.md](DEPLOY.md)**.

---

## Repo notes

- `.env` and `assets/maverx/*` (client material) are git-ignored. `.env.example`
  documents every variable.
- Generated output lands in `public/generated/<id>/` (git-ignored).
- The scaffold also ships a slide editor and project workspace under `/projects`
  for post-generation refinement; the Maverx product entry point is `/maverx`.
