# Hackathon Haarlem — Ship-Fast Starter

A pre-wired Next.js scaffold so that at **10:00 kickoff you build the idea, not the boilerplate.**
Everything below already works end-to-end (verified with a production build + live DB queries).

> **AI Hackathon Haarlem** — Sat 6 June 2026, De Koepel (Koepelplein 1, 2031 WL).
> Doors 08:00 · kickoff 09:30 · **code freeze 18:00** · top-5 pitches 19:30. Two
> challenges revealed at kickoff; pick one. Lead partner **Neno** (Dutch BV /
> banking / accounting automation); partners include **Lovable, Miro, Gemeente
> Haarlem**.

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

### Add an AI tool (function calling) — the highest-leverage upgrade

In `src/app/api/chat/route.ts`, give `streamText` a `tools` map so the agent can
actually *do* things (query your DB, hit an API). This is usually what wins
"AI vibe coding" briefs — a chat that performs actions, not just talks.

```ts
import { tool, stepCountIs } from "ai";
import { z } from "zod";
import { db } from "~/server/db";

const result = streamText({
  model: getModel(),
  system: SYSTEM_PROMPT,
  messages: await convertToModelMessages(messages),
  stopWhen: stepCountIs(5),
  tools: {
    createNote: tool({
      description: "Save a note, optionally pinned to a location",
      inputSchema: z.object({ title: z.string(), lat: z.number().optional(), lng: z.number().optional() }),
      execute: async (input) => db.note.create({ data: input }),
    }),
  },
});
```

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

## 5. Idea bank — pre-mapped to the likely briefs

The two challenges are secret until kickoff, but the sponsor lineup signals the
domains. Each idea below is **scoped to be demoable in ~6 hours** and leans on
parts this scaffold already has. Pick the closest fit once the brief drops.

### If the brief is fintech / business-admin (Neno's domain)
1. **Agentic onboarding co-pilot** — chat that walks a founder through "register a
   BV": asks questions, fills a structured form live (tool calls), shows a progress
   checklist. *Uses:* chat + tools + tRPC form state. **Wow moment:** the agent
   completes a real-looking form from a messy paragraph of user text.
2. **Invoice/receipt → structured data** — drop a photo/PDF, AI extracts
   vendor/amount/VAT into an editable table, charts spend by category. *Uses:*
   chat (vision) + chart + editor. **Wow moment:** drag a crumpled receipt → clean
   line items in 2 seconds.
3. **Compliance explainer** — paste a Dutch tax/regulation snippet, get a plain-EN
   summary + "what this means for you" + deadlines pinned to a calendar. *Uses:*
   chat + editor.

### If the brief is civic / local (Gemeente Haarlem's domain)
4. **Report-an-issue map** — citizens drop a pin on Haarlem, describe a problem
   (pothole, broken light); AI auto-categorizes + routes to the right department.
   *Uses:* map + chat (classification) + tRPC/Prisma. **This scaffold is 70% there.**
5. **Local-knowledge assistant** — chat grounded in a small corpus of city info
   (opening hours, permits, events) with sources; map shows relevant locations.
   *Uses:* chat (RAG-lite) + map.
6. **Accessibility/route helper** — pick two points on the map, AI suggests the
   most accessible route + flags obstacles. *Uses:* map + chat.

### Domain-agnostic crowd-pleasers (work for almost any brief)
7. **"Describe it, see it" dashboard** — user types a question in chat, AI picks a
   chart type and renders it from your data via a tool call. *Uses:* chat + tools +
   charts. **Strong demo: natural language → live visualization.**
8. **Voice-to-action** — speak a command, Whisper transcribes, agent executes a tool.
   High wow-per-effort if the room is loud and everyone else is typing.

### Scope discipline (this wins the day)
- **Decide your demo-able core by 11:00.** One sharp feature that visibly works
  beats three half-built ones.
- **Fake the unsexy parts.** Seed data > real auth. Hardcode > admin panel.
- **Lock the demo by 16:30**, spend 17:00–18:00 making it *look* finished
  (empty states, a logo, one smooth happy-path). Judges score polish.

---

## 6. Pitch template (top-5, ~3 minutes, no slides needed)

> Format reminder: only the top 5 teams pitch at 19:30. A working live demo on the
> projector beats a deck. Have the app **already open on the happy path** before you
> start talking.

**[0:00–0:20] Hook + problem.** One sentence on who hurts and why.
> "Registering a BV in the Netherlands takes a founder ~6 hours and three
> portals. We did it in one chat."

**[0:20–1:50] Live demo — the whole pitch.** Drive the happy path you rehearsed.
Narrate what's AI: *"watch — it pulls the address, fills the form, flags the
missing VAT field."* If something can break, pre-load that state.

**[1:50–2:20] How it works (10 seconds of tech cred).** Name-drop the stack fast:
*"Next.js, Claude with tool-calling, real DB underneath — not a mockup."*

**[2:20–2:45] Impact + what's next.** Quantify (time saved, errors avoided) and
name the obvious next step. Shows you see beyond the hack.

**[2:45–3:00] Close + ask.** One memorable line + the team name. Land it.

### Demo-day checklist
- [ ] `ANTHROPIC_API_KEY` set and tested **on the venue Wi-Fi** (corporate nets
      sometimes block API calls — test early, have a phone hotspot as backup).
- [ ] Happy path rehearsed 3× out loud; know your exact click sequence.
- [ ] App open and pre-warmed before you walk up (first AI call can be slow).
- [ ] Laptop charged + charger in bag; screen mirroring tested.
- [ ] One-liner problem statement memorized.
- [ ] A fallback screen-recording of the demo working, in case live fails.
