# AI Hackathon Haarlem — Field Brief

Everything you need on the day, in one file. No internet required.

## The facts

| | |
|---|---|
| **Event** | AI Hackathon Haarlem — "AI (Vibe) Coding Innovation" |
| **Date** | Saturday, 6 June 2026 |
| **Venue** | De Koepel / SRH Haarlem, **Koepelplein 1, 2031 WL Haarlem** (the old domed prison) |
| **Doors** | 08:00, check-in closes ~09:00 |
| **Teams** | Solo, duo, or up to 4. Only ~10–12 teams total — small, winnable field |
| **Ticket** | ~€15 (food + drinks included); SRH students 50% off |
| **Bring** | Laptop, charger, ideas. Wi-Fi provided |
| **Organizer** | The Social Club × Digilize Agency |
| **Official site** | https://hackathon.digilize.agency/ |

### Schedule

| Time | What |
|---|---|
| 08:00 | Doors open, check-in |
| 09:30 | Opening + **challenge kickoff** (two briefs revealed, pick one) |
| 10:00 | Build phase begins — **~8 hours of build time** |
| 13:30 | Lunch |
| 18:00 | **Code freeze & submission** |
| 18:00–19:00 | Dinner (Circo Pizza) |
| 19:30 | Pitches — **top 5 teams only** |
| 20:00 | Awards + closing |
| 20:30 | Drinks & networking |
| 21:30 | Optional pub crawl |

### Partners (these shape the briefs)

- **Neno** (lead) — automates Dutch **BV registration, business banking, invoicing, accounting, tax**. Strong signal one brief is fintech / business-admin automation.
- **Gemeente Haarlem** (city government) — possible civic / public-services brief.
- **Lovable + Miro** — loud signal: they reward **fast, polished, working web apps**. "Vibe coding" means a deployed clickable demo beats clever backend nobody sees.
- Other partners: Maverx, Altis Groep, Metzlr.

## How this is judged (read between the lines)

In this format judges consistently score **working demo + real-problem fit + polish** over technical depth. Your edge as a strong engineer is **shipping speed and demo polish** — out-ship, don't out-architect.

Two failure modes to avoid:
1. **Scope creep** — pick something demoable by ~15:00, then spend hours making it look real.
2. **Backend rabbit holes** — no auth systems, no real DB migrations. Seed/fake data is fine for a demo.

---

## Idea bank — pre-mapped to the likely briefs

Each idea is **scoped to be demoable in ~6 hours** and leans on parts the scaffold already has. Pick the closest fit once the brief drops.

### If the brief is fintech / business-admin (Neno's domain)
1. **Agentic onboarding co-pilot** — chat that walks a founder through "register a BV": asks questions, fills a structured form live (tool calls), shows a progress checklist. *Uses:* chat + tools + tRPC form state. **Wow:** the agent completes a real-looking form from a messy paragraph of user text.
2. **Invoice/receipt → structured data** — drop a photo/PDF, AI extracts vendor/amount/VAT into an editable table, charts spend by category. *Uses:* chat (vision) + chart + editor. **Wow:** drag a crumpled receipt → clean line items in 2 seconds.
3. **Compliance explainer** — paste a Dutch tax/regulation snippet, get a plain-EN summary + "what this means for you" + deadlines pinned to a calendar. *Uses:* chat + editor.

### If the brief is civic / local (Gemeente Haarlem's domain)
4. **Report-an-issue map** — citizens drop a pin on Haarlem, describe a problem (pothole, broken light); AI auto-categorizes + routes to the right department. *Uses:* map + chat (classification) + tRPC/Prisma. **The scaffold is ~70% there.**
5. **Local-knowledge assistant** — chat grounded in a small corpus of city info (opening hours, permits, events) with sources; map shows relevant locations. *Uses:* chat (RAG-lite) + map.
6. **Accessibility/route helper** — pick two points on the map, AI suggests the most accessible route + flags obstacles. *Uses:* map + chat.

### Domain-agnostic crowd-pleasers (work for almost any brief)
7. **"Describe it, see it" dashboard** — user types a question in chat, AI picks a chart type and renders it from your data via a tool call. *Uses:* chat + tools + charts (this is **generative UI**, already wired). **Strong demo: natural language → live visualization.**
8. **Voice-to-action** — speak a command, Whisper transcribes, agent executes a tool. High wow-per-effort if the room is loud and everyone else is typing.

### Scope discipline (this wins the day)
- **Decide your demoable core by 11:00.** One sharp feature that visibly works beats three half-built ones.
- **Fake the unsexy parts.** Seed data > real auth. Hardcode > admin panel.
- **Lock the demo by 16:30**, spend 17:00–18:00 making it *look* finished (empty states, a logo, one smooth happy-path). Judges score polish.

---

## Pitch template (top-5, ~3 minutes, no slides needed)

> Only the top 5 pitch at 19:30. A working live demo on the projector beats a deck. Have the app **already open on the happy path** before you start talking.

**[0:00–0:20] Hook + problem.** One sentence on who hurts and why.
> "Registering a BV in the Netherlands takes a founder ~6 hours and three portals. We did it in one chat."

**[0:20–1:50] Live demo — the whole pitch.** Drive the happy path you rehearsed. Narrate what's AI: *"watch — it pulls the address, fills the form, flags the missing VAT field."* If something can break, pre-load that state.

**[1:50–2:20] How it works (10s of tech cred).** Name-drop the stack fast: *"Next.js, Claude with tool-calling, real DB underneath — not a mockup."*

**[2:20–2:45] Impact + what's next.** Quantify (time saved, errors avoided) and name the obvious next step. Shows you see beyond the hack.

**[2:45–3:00] Close + ask.** One memorable line + the team name. Land it.

## Demo-day checklist

- [ ] `ANTHROPIC_API_KEY` set and tested **on the venue Wi-Fi** (corporate nets sometimes block API calls — test early, have a phone hotspot as backup).
- [ ] Happy path rehearsed 3× out loud; know your exact click sequence.
- [ ] App open and pre-warmed before you walk up (first AI call can be slow).
- [ ] Laptop charged + charger in bag; screen mirroring tested.
- [ ] One-liner problem statement memorized.
- [ ] A fallback screen-recording of the demo working, in case live fails.

## Logistics

- Train to **Haarlem Station**, ~15 min walk to Koepelplein (or short bus).
- Aim to **arrive ~08:15** — early check-in means you grab power, a good seat, and time to scope a team.
- Buy the ticket in advance if you haven't.
