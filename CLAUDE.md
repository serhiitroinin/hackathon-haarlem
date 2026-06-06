# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # dev server on localhost:3000 (Turbopack)
pnpm build            # production build (ESLint is silenced; TS errors still fail)
pnpm typecheck        # full TypeScript check (no emit)
pnpm check            # lint + typecheck together
pnpm lint             # ESLint only
pnpm lint:fix         # ESLint with auto-fix
pnpm format:write     # Prettier fix
pnpm db:push          # sync prisma/schema.prisma → DB (no migration files in dev)
pnpm db:studio        # Prisma Studio GUI
pnpm inspect:master   # print master.pptx slide/shape names (Maverx setup)
```

No test suite is present. Use `pnpm typecheck` as the correctness gate.

## Architecture overview

This is a **Next.js 15 (App Router) + React 19** app. Two distinct products share the same repo:

### 1. Scaffold demo (`/`)
A reference mini-app wiring all primitives together: Tiptap rich-text editor, MapLibre map, Recharts chart, and an AI chat agent that can create/list notes. Intended as a rip-out reference — not precious.

- **tRPC API** (`src/server/api/routers/`) — typesafe procedures consumed from the client via `api.<router>.<proc>.useQuery/useMutation()`, imported from `~/trpc/react`.
- **Generative UI pattern** — AI tools return typed objects; `src/components/chat/generative/registry.tsx` maps tool names → React components. Add a new visual in one line.
- **DB**: Prisma + PostgreSQL (`prisma/schema.prisma`). In dev, use `docker-compose up` (see `docker-compose.yml`) or provide a remote `DATABASE_URL`. `pnpm db:push` applies schema without migration files.

### 2. Maverx Training Builder (`/maverx`)
A multi-step UI that turns a training brief into an editable PPTX + pre/post-bite DOCX. The main product in this repo.

**User flow (3 steps):**
```
Step 1: IntakeForm      → user fills topic, audience, level, duration, objective + optional file uploads
Step 2: FollowUpQuestions → AI generates contextual questions; user answers optionally
Step 3: SlideGenerationLoader → animated reveal → SlideBuilder (full deck editor)
```

**State management:** Local `useState` in `src/components/maverx/maverx-workspace.tsx`. No global store. Data flows down as props.

**AI generation pipeline** (all server-side):
```
/api/maverx-chat  →  generateTraining tool  →  pipeline.ts
                                                  ├── generate-content.ts  (generateObject → TrainingPlan)
                                                  ├── build-pptx.ts        (pptx-automizer clones master layouts)
                                                  ├── add-notes.ts         (5-field speaker notes per slide)
                                                  └── build-bites.ts       (pre/post-bite .docx)
```

**Key Maverx files:**

| Path | Role |
|---|---|
| `src/lib/maverx/schema.ts` | Zod types: `Intake`, `TrainingPlan`, `Slide`, `SpeakerNotes`, `BLOCKS` |
| `src/lib/maverx/generate-content.ts` | `generateObject()` → validated `TrainingPlan` |
| `src/lib/maverx/build-pptx.ts` | Clone master slides, fill placeholders |
| `src/lib/maverx/layout-map.ts` | Maps didactic block → master slide number + shape names (**tune after dropping master.pptx**) |
| `src/lib/maverx/pipeline.ts` | Orchestrates generation, writes to `public/generated/` |
| `src/lib/ai.ts` | `getModel()` / `getContentModel()` — single place to swap provider/model |
| `src/app/api/maverx-questions/route.ts` | Generates AI follow-up questions from intake data |

**Didactic model** — every training must follow `kickoff → theory → example → exercise → wrapup`. The `BLOCKS` constant in `schema.ts` is the source of truth. `arcPresent()` validates it.

**Speaker notes** — all 5 fields (`aim`, `time`, `instructions`, `reflectiveQuestion`, `debrief`) are required on every slide. This is a hard Maverx requirement.

### AI / model config

Controlled entirely through `.env` — no code changes needed to swap providers:

```bash
AI_PROVIDER=anthropic          # anthropic | openai | openrouter
AI_MODEL=claude-sonnet-4-6     # any model id for the provider
AI_CONTENT_MODEL=              # optional stronger model for training generation
```

`getModel()` is used for chat + question generation. `getContentModel()` is used for the heavier `generateObject()` training plan call.

### SlideBuilder

`src/components/builder/slide-builder.tsx` is a standalone deck editor: left panel (slide list), center canvas (`slide-canvas.tsx`), right inspector. Persists to `localStorage` key `"mvx-deck-v1"`. Types live in `src/components/builder/types.ts`.

## Path aliases

`~/` maps to `src/` (configured in `tsconfig.json`). Always use `~/` imports.

## Prisma client import

```ts
import { db } from "~/server/db";
```

Generated client is at `generated/prisma` (custom output in `schema.prisma`).
