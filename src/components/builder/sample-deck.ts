import { type Deck, type SpeakerNotes } from "./types";

const notes = (n: SpeakerNotes) => n;

/**
 * A realistic seed deck modelled on the example training in the style guide
 * ("Applied AI for Professionals"). It follows the Maverx structure
 * (cover → about → timetable → topic intro → example → exercise → wrap-up) and
 * deliberately includes a few style-guide violations so the attention flags are
 * visible out of the box.
 */
export const SAMPLE_DECK: Deck = {
  title: "Applied AI for Professionals",
  slides: [
    {
      id: "s-cover",
      kind: "cover",
      title: "Applied AI for Professionals",
      subtitle: "from curiosity to real, responsible use",
      accent: "orange",
      notes: notes({
        aim: "Set the tone and frame the day.",
        time: "2 min",
        instructions: "Welcome the group, introduce yourself, preview the arc of the session.",
        keyPoints: "Practical, hands-on, no coding required.",
        linkToReality: "Ask: where have you already bumped into AI at work?",
        debrief: "Today you leave with one concrete use case of your own.",
      }),
    },
    {
      id: "s-about",
      kind: "content",
      eyebrow: "Before we start · About this session",
      title: "What you'll get out of today",
      accent: "purple",
      bullets: [
        "**Identify** where AI fits your own workflows — analysis, documents, reporting",
        "**Distinguish** automation, decision support and augmentation",
        "**Apply** AI tools to real data and outputs in hands-on exercises",
        "**Evaluate** AI outputs critically — spot errors, assumptions and risk",
        "Leave with a **concrete use case** and a next step for your work",
      ],
      notes: notes({
        aim: "Align on outcomes and set expectations.",
        time: "3 min",
        instructions: "Walk the five outcomes; emphasise this is about real value, not theory.",
        keyPoints: "Outcomes are verbs — identify, distinguish, apply, evaluate, design.",
        linkToReality: "Tie each outcome to a task someone in the room does weekly.",
        debrief: "Everyone should see themselves in at least one outcome.",
      }),
    },
    {
      id: "s-timetable",
      kind: "timetable",
      eyebrow: "Timetable · Trainer view",
      title: "How the session runs",
      accent: "teal",
      rows: [
        { time: "10 min", module: "Understand", activities: "History & how AI works — the three waves, why accessibility changed everything" },
        { time: "10 min", module: "Reflect", activities: "Privacy & ethics — enterprise vs public tools, 2–3 real cases to debrief" },
        { time: "60 min", module: "Experience", activities: "Hands-on — automation, decision support and augmentation across three exercises" },
        { time: "15 min", module: "Apply", activities: "Work on your own case, then recap how the three roles combine" },
      ],
      notes: notes({
        aim: "Give trainers a clear time budget.",
        time: "1 min",
        instructions: "Don't read the table aloud — just point to the shape of the day.",
        keyPoints: "60 of 95 minutes are hands-on.",
        linkToReality: "Reassure: most of the time you'll be doing, not listening.",
        debrief: "Keep the room oriented in time throughout.",
      }),
    },
    {
      id: "s-section",
      kind: "section",
      eyebrow: "Topic 1",
      title: "How AI actually works",
      subtitle: "input, pattern, predicted output",
      accent: "rose",
      notes: notes({
        aim: "Reset attention for a new block.",
        time: "30 sec",
        instructions: "Pause, breathe, signal the shift into theory.",
        keyPoints: "We're moving from why to how.",
        linkToReality: "",
        debrief: "Short and punchy — this is a divider.",
      }),
    },
    {
      id: "s-theory",
      kind: "content",
      eyebrow: "Topic 1 · Theory",
      title: "Pattern matching, not understanding",
      accent: "purple",
      bullets: [
        "AI turns **input** into a **predicted output** by matching patterns at scale",
        "It does **not** reason or truly understand — it predicts what's likely",
        "Accessibility, not raw capability, is what made it suddenly useful",
        "Knowing this shapes **when to trust it** and when to check its work",
      ],
      notes: notes({
        aim: "Build an accurate mental model of AI.",
        time: "10 min",
        instructions: "Use the input → pattern → output frame; stress what AI does NOT do.",
        keyPoints: "Prediction ≠ understanding; check outputs.",
        linkToReality: "Compare to autocomplete that has read the whole internet.",
        debrief: "If they remember one thing: it predicts, it doesn't reason.",
      }),
    },
    {
      id: "s-example",
      kind: "example",
      eyebrow: "Topic 1 · Example in practice",
      title: "Reading an invoice",
      accent: "teal",
      bullets: [
        "Drop a messy **PDF invoice** in and ask for structured fields",
        "The model spots **supplier, date, totals** without explicit rules",
        "Where else does this exact shape of task show up in **your** work?",
      ],
      notes: notes({
        aim: "Make the theory concrete and recognisable.",
        time: "5 min",
        instructions: "Demo live if you can; otherwise screenshot the before/after.",
        keyPoints: "Same task = extract structure from a document.",
        linkToReality: "Invoices, forms, contracts, CVs — all the same pattern.",
        debrief: "Invite one example from the room before moving on.",
      }),
    },
    {
      id: "s-exercise",
      kind: "exercise",
      // Deliberately long title -> triggers an attention flag for the demo.
      title: "Exercise 1 — extract structured data from your own documents and discuss",
      eyebrow: "Topic 1 · Exercise",
      accent: "orange",
      bullets: [
        "In pairs, pick a document you actually work with",
        "Ask the AI to pull it into a clean table of fields/values", // contains "/" -> info flag
        "Compare results and note where it was wrong or unsure",
      ],
      notes: notes({
        aim: "Apply extraction to participants' real work.",
        time: "15 min",
        instructions: "Pairs, 10 min hands-on + 5 min share-back.",
        keyPoints: "",
        linkToReality: "",
        debrief: "Surface one win and one failure from the room.",
      }),
    },
    {
      id: "s-wrapup",
      kind: "wrapup",
      eyebrow: "Wrap up & reflection",
      title: "What's next",
      accent: "rose",
      bullets: [
        "You can name **where AI fits** your own work",
        "You've applied **automation, decision support and augmentation**",
        "Your next step: take **one task** back and try it this week",
      ],
      notes: notes({
        aim: "Consolidate and commit to action.",
        time: "5 min",
        instructions: "Each person writes one task they'll try; a few share aloud.",
        keyPoints: "One concrete commitment per person.",
        linkToReality: "Make it this week, not someday.",
        debrief: "Close on momentum — small, real, immediate.",
      }),
    },
  ],
};
