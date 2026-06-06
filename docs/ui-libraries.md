# React UI Libraries for Distinctive / Animated Interfaces (2026)

A toolkit organized by the *effect* you're going for, mapped to the movements in
[ui-research-2026.md](./ui-research-2026.md). Names/state verified June 2026.

> Already in this scaffold: **Motion** (`motion/react`), **Sonner**,
> **NumberFlow**, **shadcn/ui**, **Recharts**, **Tiptap**, the **Vercel AI SDK**
> (with generative UI wired). Items marked ✅ are installed.

## 1. The motion engine — pick one as your foundation

| Lib | Install | Use for |
|---|---|---|
| **Motion** (ex-Framer Motion) ✅ | `pnpm add motion` → `import { motion } from "motion/react"` | The React default. Layout animations, gestures, spring physics, `AnimatePresence`. Backbone of most libs below |
| **GSAP** (+ `@gsap/react`) | `pnpm add gsap @gsap/react` | Timeline choreography + **ScrollTrigger**. For complex sequenced/scroll work. Fully free incl. all plugins |
| **React Spring** | `pnpm add @react-spring/web` | Pure spring physics. Pair with `use-gesture` for draggable, throw-able, "physical" feel |

Training: Emil Kowalski's [animations.dev](https://animations.dev/) — *the* course, on the "motion only when it serves function" principle.

## 2. Copy-paste animated component registries (fastest distinctive win)

shadcn-style — a CLI drops **source into your repo**, you own/tweak it. Compatible with Tailwind v4 + shadcn.

- **Motion-Primitives** — [motion-primitives.com](https://motion-primitives.com/) — tasteful animated text, morphing dialogs, scroll effects. *Top pick for not-overdone.*
- **Animate UI** — [animate-ui.com](https://animate-ui.com/) — shadcn components *pre-animated* with Motion. Drop-in upgrades.
- **Magic UI** — `pnpm dlx shadcn@latest add "https://magicui.design/r/<comp>"` — 150+ animated components (marquees, shimmer, particles).
- **Aceternity UI** — the flashy 3D-card / spotlight / aurora effects. High wow; use sparingly or it screams "template."
- **Cult UI** · **React Bits** ([reactbits.dev](https://reactbits.dev/)) — more curated animated bits, text effects, backgrounds.

> Differentiation comes from *which 2–3 you use and how restrained you are*.

## 3. Craft primitives — best-in-class, just ship them

- **Vaul** — `pnpm add vaul` — iOS-style **drawer** with real drag physics. [vaul.emilkowal.ski](https://vaul.emilkowal.ski/)
- **Sonner** ✅ — toast standard.
- **cmdk** — `pnpm add cmdk` — the **⌘K command menu**. Instantly makes an app feel "designed."

## 4. Physicality & gesture — the under-served "Family / Teenage Engineering" lane

- **@use-gesture/react** — `pnpm add @use-gesture/react` — drag/pinch/wheel/hover. Pair with Spring/Motion → fling-able cards, pull-to-dismiss, rubber-banding.
- **react-three-rapier** — `pnpm add @react-three/rapier` — real **physics** (gravity, collisions) in R3F. Toy-like, bouncy interfaces. [github](https://github.com/pmndrs/react-three-rapier)
- **Matter.js** — 2D physics for falling/colliding elements without 3D.

## 5. Micro-detail polish (cheap, high-impact)

- **NumberFlow** ✅ — `@number-flow/react` — buttery **animated numbers/counters**, dependency-free. [number-flow.barvian.me](https://number-flow.barvian.me/)
- **Lenis** — `pnpm add lenis` → `lenis/react` — **smooth scroll** standard (3KB). [lenis.dev](https://www.lenis.dev/)
- **AutoAnimate** — `pnpm add @formkit/auto-animate` — one-line list/layout transitions.
- **split-type** / Motion text features — per-character/word text reveals.

## 6. 3D / spatial (WebGL — hero/brand surfaces)

- **react-three-fiber** + **drei** — `pnpm add three @react-three/fiber @react-three/drei` — declarative Three.js. WebGPU is production-baseline now.
- **Spline** — `pnpm add @splinetool/react-spline` — "Figma for 3D": design a scene, embed as a component. Fastest path to interactive 3D without shaders.
- **Rive** — `pnpm add @rive-app/react-canvas` — **interactive state-machine** animations, 10–15× smaller than Lottie, 120fps. Best for reactive micro-interactions.
- **Lottie** — `pnpm add lottie-react` — play designer animations. Simpler than Rive but **not interactive**.

## 7. AI-native / generative UI

You already have the **Vercel AI SDK** with generative UI wired (tool output →
React component). Dedicated frameworks if you want the model to drive layout:

- **Tambo** — `pnpm add @tambo-ai/react` — register components with Zod schemas; the agent picks one and **streams props**. [docs.tambo.co](https://docs.tambo.co/)
- **Thesys C1 / Crayon** — `@thesysai/genui-sdk` + `@crayonai/react-ui` — an OpenAI-compatible endpoint that **returns UI instead of text**. [thesys.dev](https://www.thesys.dev/)

## 8. Whole component systems (motion built in)

- **HeroUI** (ex-NextUI) — `pnpm add @heroui/react` — full lib, Motion-animated by default, more characterful than shadcn's neutral look.
- **Base UI** (shadcn/MUI team's headless primitives) · **Ark UI** · **React Aria** — headless behavior + a11y; you bring the motion. Best when you want *your own* look.

---

## Recommended combo for this scaffold (don't sprawl)

On top of what's installed (Motion + Sonner + NumberFlow), add at most:

1. **cmdk** — instant "designed" feel (command palette).
2. **One signature moment** — either a **Vaul** drawer with real drag (tactile/physical angle) or lean harder on the **generative-UI** tool→component pattern already wired.

That reads as *craft* without looking like a template, and is ~15 min of integration.
