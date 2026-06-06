# Distinctive UI in 2025–2026 — An Opinionated Survey

Research notes on where UI differentiation is moving now that competent UI is a
commodity. Sources verified against primary material (links at the bottom).

## The thesis

Producing a *competent* UI has collapsed to near-zero marginal cost. AI codegen
(v0, Cursor, Lovable, Claude) + shadcn/ui + Tailwind means any prompt yields a
passable React interface — and **they all converge on the same shape**. An Adobe
study found >42% of AI-generated interfaces share near-identical navigation and
components; shadcn has become the *lingua franca of generated UI*.

The differentiator everyone now points to is **"feel" — disciplined interaction
craft and taste** — framed as the *last defensible moat* once engineering
velocity is free. The sharpest line: *"Code got cheap. Taste didn't."* Taste here
is **not** aesthetics; it's the thousand small decisions and what's *left out* —
recognizable in seconds, uncopyable because it can't be prompted.

## People & studios to watch

| Name | What they do | What's distinctive | Link |
|---|---|---|---|
| **Rauno Freiberg** | Staff Design Engineer, Vercel (ex-Browser Company/Arc) | The reference voice on interaction craft. Treats code as a design medium; will add a "random 6px radius to make it feel right." Authored **Devouring Details** | [rauno.me](https://rauno.me/) · [devouringdetails.com](https://devouringdetails.com/) |
| **Emil Kowalski** | Design Engineer, Linear (ex-Vercel) | Motion-craft authority. Built **Sonner** + **Vaul** (~70M downloads/wk combined). Thesis: motion distinguishes only when it serves function | [emilkowal.ski](https://emilkowal.ski/) · [animations.dev](https://animations.dev/) |
| **Paco Coursey** | Design Engineer, Linear (ex-Vercel) | Built **cmdk** (the command menu behind a generation of ⌘K palettes) | [paco.me](https://paco.me/) |
| **Benji Taylor** | Head of Design, X; founder of **Family** wallet | Family = best-in-class UX: cards that physically move between screens, addresses that animate to *explain* state | [benji.org/family-values](https://benji.org/family-values) |
| **Jordan Singer** | Founder, **Mainframe** (ex-Figma) | Diagram → acquired by Figma → seeded Figma AI. Longest-running builder at the design×AI seam | [interview](https://pulse2.com/mainframe-profile-jordan-singer-interview/) |
| **Steve Ruiz** | Founder, **tldraw** | Infinite-canvas SDK; viral AI demos — **Make Real** (sketch→React), tldraw.computer | [tldraw](https://tldraw.substack.com/p/make-real-the-story-so-far) |
| **Igloo Inc** | Studio | Awwwards **Site of the Year 2025**; immersive scroll-driven WebGL | [Awwwards](https://www.awwwards.com/inspiration/links-igloo-inc) |

> The handcraft camp (Rauno, Emil, Paco) all orbit Vercel/Linear — the same
> companies shipping the tools that commoditize UI. Not hypocrisy: *commoditize
> the floor, compete on the ceiling only craft can reach.*

## Movements — substance vs fad

- **Interaction craft / "feel" as the moat** — *Substance, the whole game.* Not a style — a discipline: micro-timing, easing, physicality of state transitions. Exemplars: Rauno, Emil, Family.
- **Spatial / 3D (WebGL→WebGPU, R3F, shaders)** — *Substance for brand/marketing surfaces, fad bolted onto product UI.* Newly cheap, but mostly lives at the landing-page layer.
- **Teenage-Engineering-style digital physicality** — toy-like, tactile, object-feeling software. *Substance, and the genuinely under-served lane.* Universally admired, almost never shipped (Family is the rare proof). **The freshest open lane for 2026.**
- **Neo-brutalism / anti-design** — *Mostly fad.* Its energy is *reaction to sameness*, so it's downstream of the same commoditization and will commoditize itself the moment AI tools add a "brutalist" preset. A tell, not a solution.
- **Monospace / terminal aesthetic** — *Substance in dev-tools* (credibly "by engineers, for engineers"), borrowed authority elsewhere.
- **Bento grids** — *Exhausted.* Now explicitly commodity, alongside WebGL hero sections.

## AI-native UI (beyond the chatbox)

- **Generative UI — constrain, don't free-code.** Vercel open-sourced v0's generative-UI tech in the AI SDK: the model renders *vetted React components from tool results*, not arbitrary code. The mature pattern is the model **selects and configures** trusted components — predictable and trustworthy. *(This scaffold implements exactly this — see the chat's tool→component registry.)*
- **Malleable software** — **Geoffrey Litt** (Notion / ex-Ink & Switch): "Malleable software in the age of LLMs"; AI as the bridge to end-user programming. **Linus Lee / @thesephist** (Notion): latent-space canvases, "better interfaces to language models."
- **Post-chatbox critique** — **Amelia Wattenberger**: chatbots *lack affordances* and dump cognitive load on users; responses should live in a persistent **working buffer**, not isolated bubbles.
- **Canvas-as-conversation** — tldraw's Make Real / fairies: the infinite canvas as the AI workspace instead of a thread.
- **Agentic browsers** — The Browser Company killed Arc to ship **Dia**. Josh Miller: *"People aren't interfacing with the internet through web pages anymore — they're interfacing with AI models."*

## Contrarian / fresh takes

1. **The design system is now for the machine, not the human.** Teams encode taste into shadcn-shaped tokens/blocks *so the AI generates on-brand*. The moat isn't your UI — it's your **machine-readable encoding of judgment**.
2. **Generative UI may *deepen* sameness, not break it.** It collides with the 42%-identical finding and NN/g's *State of UX 2026* verdict that **trust is now the central AI-UX problem** ("adoption growing, trust falling"). A confident-but-wrong UI collapses trust regardless of polish. The AI-native frontier and the commoditization problem are the *same* problem.
3. **The two camps are the same company** (commoditize the floor, compete on the ceiling).
4. **The under-served direction is Teenage-Engineering-style digital physicality** — tactile, emotional, object-feeling software. If you want non-obvious differentiation in 2026, this is the open lane — far more than another WebGL hero section.
5. **"Anti-design" is a tell, not a solution** — it'll commoditize itself the moment AI tools ship a "brutalist" preset.

## One-line takeaway

The defensible edge in 2026 isn't *which* components you use (everyone has the
same ones) — it's **motion, physicality, and the judgment of what to leave out**,
plus how well you encode that taste so AI can reproduce it. The single freshest,
least-crowded direction is **tactile / physical software**.

## Unverified flags

`Thesys`, `Maggie Appleton`, and `Basement Studio` did not corroborate in the
research pass — treat as follow-up, not confirmed. (Appleton's ambient/agentic-UI
writing is real and worth finding directly; it just didn't surface here.)

## Sources

- [The end of interface / "feel" as moat — Forte Group](https://www.fortegrp.com/insights/the-end-of-interface-why-only-apis-will-matter)
- [Taste is the New Moat — Andrés Max](https://andresmax.com/taste-is-the-new-moat/)
- [shadcn as lingua franca of generated UI — Pawel Klasa](https://medium.com/design-bootcamp/the-most-important-design-system-in-2026-that-designers-missed-was-built-by-a-developer-d5617753882e)
- [AI-powered prototyping with design systems — Vercel](https://vercel.com/blog/ai-powered-prototyping-with-design-systems)
- [Rauno Freiberg interview — ui.land](https://ui.land/interviews/rauno-freiberg) · [Devouring Details](https://devouringdetails.com/)
- [Emil Kowalski](https://emilkowal.ski/) · [animations.dev](https://animations.dev/)
- [Paco Coursey interview — ui.land](https://ui.land/interviews/paco-coursey)
- [Family Values — Benji Taylor](https://benji.org/family-values)
- [Jordan Singer / Mainframe](https://pulse2.com/mainframe-profile-jordan-singer-interview/)
- [tldraw Make Real](https://tldraw.substack.com/p/make-real-the-story-so-far)
- [Geoffrey Litt](https://www.geoffreylitt.com/) · [Linus Lee — latent interfaces](https://thesephist.com/posts/latent/)
- [Amelia Wattenberger](https://wattenberger.com/) · [UX Tools episode](https://www.uxtools.co/episodes/amelia-wattenberger-designing-the-next-flow-state)
- [Vercel AI SDK 3.0 generative UI](https://vercel.com/blog/ai-sdk-3-generative-ui)
- [Dia browser launch — TechCrunch](https://techcrunch.com/2025/06/11/the-browser-company-launches-its-ai-first-browser-dia-in-beta/)
- [Teenage Engineering design — read.cv](https://read.cv/jdsimcoe/inside-design-at-teenage-engineering)
- [Neobrutalism — NN/g](https://www.nngroup.com/articles/neobrutalism/)
- [Igloo Inc — Awwwards](https://www.awwwards.com/inspiration/links-igloo-inc)
- [WebGPU / View Transitions / Interop 2026 — TheBomb](https://thebomb.ca/blog/emerging-web-technologies-webgpu-view-transitions-2026/)
- [Generative-UI sameness / trust — aivancity](https://aivancity.ai/en/blog/ui-ux-notre-selection-des-meilleurs-outils-ia-generatives-de-2026/) · [NN/g critique — axbom](https://axbom.com/nielsen-generative-ui-failure/)
