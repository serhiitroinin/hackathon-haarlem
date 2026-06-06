# Hackathon Haarlem — Ship-Fast Starter

A pre-wired Next.js scaffold so that at **10:00 kickoff you build the idea, not the boilerplate.**
Everything below already works end-to-end (verified with a production build + live DB queries).

> **AI Hackathon Haarlem** — Sat 6 June 2026, De Koepel (Koepelplein 1, 2031 WL).
> Doors 08:00 · kickoff 09:30 · **code freeze 18:00** · top-5 pitches 19:30. Two
> challenges revealed at kickoff; pick one. Lead partner **Neno** (Dutch BV /
> banking / accounting automation); partners include **Lovable, Miro, Gemeente
> Haarlem**.

## Docs (self-contained, no internet needed)

- **[docs/hackathon-brief.md](docs/hackathon-brief.md)** — event facts, schedule, idea bank mapped to the likely briefs, pitch template, demo-day checklist.
- **[docs/ui-research-2026.md](docs/ui-research-2026.md)** — opinionated survey of distinctive UI in 2026 (the "taste is the moat" thesis, people to watch, movements, AI-native UI).
- **[docs/ui-libraries.md](docs/ui-libraries.md)** — React UI/animation library toolkit with install commands, organized by effect.

---

## 0. Get running (60 seconds)

```bash
pnpm install
cp .env.example .env          # then paste your ANTHROPIC_API_KEY
pnpm db:push                  # creates the SQLite DB from the schema
pnpm dev                      # http://localhost:3000
```

Only thing you must add to `.env`: `ANTHROPIC_API_KEY`. Everything else has a
working default (SQLite DB, free Carto map tiles, `claude-sonnet-4-6`).

## 1. What's in the box

| Layer | Tech | Where |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | `src/app/` |
| Typesafe API | tRPC v11 (+ TanStack Query) | `src/server/api/routers/`, `src/trpc/` |
| Validation | Zod | router inputs |
| DB / ORM | Prisma + SQLite | `prisma/schema.prisma` |
| UI | shadcn/ui (new-york) + Tailwind v4 | `src/components/ui/` |
| AI chat | Vercel AI SDK v6 (streaming) + Claude | `src/app/api/chat/route.ts`, `src/components/chat/` |
| Maps | MapLibre GL via react-map-gl (no token) | `src/components/map/` |
| Charts | Recharts (shadcn charts) | `src/components/charts/` |
| Rich text | Tiptap v3 | `src/components/editor/` |
| Theme | next-themes + dark mode | `src/components/theme-*.tsx` |
| Toasts | sonner | `Toaster` in `layout.tsx` |

The homepage (`src/components/workspace.tsx`) is a **working mini-app** that wires
all of it together: write a rich-text note, click the Haarlem map to pin it, save
it through tRPC→Prisma→SQLite, watch it appear on the map and in the per-day chart.
It's a reference, not precious — **rip out the pieces you need.**

## 2. The 3 things you'll actually change

1. **The data model** → `prisma/schema.prisma`, then `pnpm db:push`. Rename `Note`
   to whatever your idea needs; add fields. No migrations needed in dev.
2. **The API** → add procedures in `src/server/api/routers/`, register in `root.ts`.
   Fully typesafe to the client via `api.<router>.<proc>.useQuery()`.
3. **The AI behavior** → `src/app/api/chat/route.ts`. Change the system prompt; add
   **tools** (function calling) so the model can read/write your data. Swap model
   in `.env` (`AI_MODEL`, `AI_PROVIDER`) with zero code change.

### AI tool-calling is already wired (this is usually what wins "AI vibe coding")

`src/app/api/chat/route.ts` gives `streamText` a `tools` map so the agent doesn't
just talk — it **operates the app**. Two live tools ship in the box:
`createNote` (writes to the DB, optionally pins to the map) and `listNotes`
(reads). `stopWhen: stepCountIs(5)` lets the model call a tool, see the result,
then reply. The chat UI renders each tool call as a status chip, and on finish it
invalidates the tRPC queries so the **map and chart update live**.

Try it: open the **AI Chat** tab and type *"save a note pinned to the Grote Markt
in Haarlem"* — watch the pin appear on the Build tab.

Add your own tool by dropping another entry in the `tools` map:

```ts
import { tool, stepCountIs } from "ai";
import { z } from "zod";
import { db } from "~/server/db";

tools: {
  // ...existing createNote / listNotes...
  deleteNote: tool({
    description: "Delete a note by id",
    inputSchema: z.object({ id: z.string() }),
    execute: async ({ id }) => db.note.delete({ where: { id } }),
  }),
},
```

The same pattern calls any external API (geocoding, search, payments sandbox) —
just `fetch` inside `execute` and return JSON the model can reason about.

### Generative UI — the agent renders components, not text

Tool *output* is rendered as a real animated React component instead of a wall of
text. The `summarizeNotes` tool returns stats; the chat draws a
`NotesSummaryCard` (Motion-animated bars + NumberFlow counters). `createNote`
returns a `NoteCreatedCard` with a spring entrance. This is the
constrain-don't-free-code pattern: the model picks a tool, the **app** decides
the UI.

- Components: `src/components/chat/generative/*`
- Registry (tool name → component): `src/components/chat/generative/registry.tsx`
- Motion entrances + `AnimatePresence` live in `src/components/chat/chat.tsx`

Give a new tool a visual in one line — add it to the `renderers` map in
`registry.tsx`:

```tsx
const renderers = {
  createNote: (o) => <NoteCreatedCard {...(o as NoteCreatedOutput)} />,
  summarizeNotes: (o) => <NotesSummaryCard {...(o as NotesSummaryOutput)} />,
  // myTool: (o) => <MyCard {...(o as MyOutput)} />,
};
```

Try it: open **AI Chat**, save a couple of pinned notes, then ask
*"give me a summary of my notes."*

**Motion** (`motion/react`, v12) + **NumberFlow** (`@number-flow/react`) are
installed and ready for any other interaction-craft you want to add.

## 3. Deploying (if a demo URL helps your pitch)

SQLite is local-only. To deploy on Vercel:
1. Create a free Postgres at **neon.tech**, copy the connection string.
2. In `prisma/schema.prisma` set `provider = "postgresql"`.
3. Set `DATABASE_URL` (+ `ANTHROPIC_API_KEY`) in Vercel env, run `pnpm db:push`, deploy.

Most demos run fine on `localhost` over the projector — don't burn build time on a
deploy unless the brief rewards a shareable link.

## 4. Commands

| | |
|---|---|
| `pnpm dev` | dev server (Turbopack) |
| `pnpm db:push` | sync schema → DB (no migration files) |
| `pnpm db:studio` | Prisma Studio (browse/edit data) |
| `pnpm typecheck` | full TS check |
| `pnpm build` | production build (lint won't block it — see `next.config.js`) |

---

## 5. Strategy: idea bank, pitch & demo checklist

Moved to **[docs/hackathon-brief.md](docs/hackathon-brief.md)** so it's a single,
self-contained field guide you can open on the day:

- **Idea bank** — 8 concepts scoped to ~6 hours, mapped to the likely
  fintech (Neno) and civic (Gemeente Haarlem) briefs, with which scaffold pieces each uses.
- **Pitch template** — the 3-minute, no-slides structure for the top-5 round.
- **Demo-day checklist** + scope discipline + logistics.

Design context for going beyond a generic UI:
**[docs/ui-research-2026.md](docs/ui-research-2026.md)** (the "taste is the moat"
survey) and **[docs/ui-libraries.md](docs/ui-libraries.md)** (animation/UI library toolkit).
