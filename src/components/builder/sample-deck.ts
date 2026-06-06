import { type Deck, type SpeakerNotes } from "./types";

const notes = (n: SpeakerNotes) => n;

export const MOCK_DECK: Deck = {
  title: "Effective Feedback Conversations",
  slides: [
    {
      id: "m-cover",
      kind: "cover",
      title: "Effective Feedback Conversations",
      subtitle: "giving and receiving feedback that actually changes behaviour",
      accent: "teal",
      notes: notes({
        aim: "Set a psychologically safe tone from the first slide.",
        time: "2 min",
        instructions:
          "Welcome the group, introduce yourself briefly, and acknowledge that most people find feedback uncomfortable — that's the whole point of today.",
        keyPoints: "Practical, evidence-based, and grounded in real workplace situations.",
        linkToReality: "Ask: who has given feedback in the last two weeks and felt it landed well?",
        debrief: "Today you leave with one conversation you've been putting off — and a plan.",
      }),
    },
    {
      id: "m-about",
      kind: "content",
      eyebrow: "Before we start · About this session",
      title: "What you'll get out of today",
      accent: "purple",
      bullets: [
        "**Name** the three most common reasons feedback conversations stall or backfire",
        "**Apply** the SBI model to turn vague impressions into specific, actionable messages",
        "**Practise** giving and receiving feedback in a low-stakes environment",
        "**Reframe** receiving feedback as a leadership skill, not a passive act",
        "Leave with a **concrete conversation** drafted and ready to deliver this week",
      ],
      notes: notes({
        aim: "Align on outcomes and show this session is different from typical HR training.",
        time: "3 min",
        instructions:
          "Walk the five outcomes; stress that the goal is one real conversation, not a certificate.",
        keyPoints: "Every outcome is a verb — name, apply, practise, reframe, draft.",
        linkToReality: "Ask each person to mentally pick a feedback conversation they've been avoiding.",
        debrief: "Everyone should have a face in mind before the first break.",
      }),
    },
    {
      id: "m-timetable",
      kind: "timetable",
      eyebrow: "Timetable · Trainer view",
      title: "How the two hours run",
      accent: "orange",
      rows: [
        {
          time: "20 min",
          module: "Why it stalls",
          activities: "Neuroscience of threat response · common avoidance patterns · group debrief",
        },
        {
          time: "30 min",
          module: "The SBI model",
          activities: "Situation · Behaviour · Impact framework · live modelling with real examples",
        },
        {
          time: "35 min",
          module: "Practise",
          activities: "Paired role-play with observer · debrief rounds · refinement",
        },
        {
          time: "15 min",
          module: "Receiving well",
          activities: "SARA response model · active listening · turning feedback into a question",
        },
        {
          time: "10 min",
          module: "Commit",
          activities: "Personal action plan · one conversation drafted · share-out",
        },
      ],
      notes: notes({
        aim: "Give trainers a clear time budget and set participant expectations.",
        time: "1 min",
        instructions: "Point to the shape — heavy on practice (35 min) and light on lecture.",
        keyPoints: "110 of 120 minutes involve active participation.",
        linkToReality: "Reassure: you won't be role-playing with strangers for long stretches.",
        debrief: "Keep this slide visible on a secondary screen during the session.",
      }),
    },
    {
      id: "m-section1",
      kind: "section",
      eyebrow: "Part 1",
      title: "Why feedback conversations stall",
      subtitle: "threat, avoidance, and the good intentions gap",
      accent: "rose",
      notes: notes({
        aim: "Reset attention and signal a shift into the diagnostic phase.",
        time: "30 sec",
        instructions: "Read the subtitle aloud and let it sit for a beat before moving on.",
        keyPoints: "We're diagnosing before we prescribe.",
        linkToReality: "",
        debrief: "Short — this is a divider, not a teaching moment.",
      }),
    },
    {
      id: "m-theory",
      kind: "content",
      eyebrow: "Part 1 · Theory",
      title: "The SBI model — three moves, not a script",
      accent: "purple",
      bullets: [
        "**Situation** — anchor the conversation: when and where did this happen?",
        "**Behaviour** — describe only what you observed, not what you inferred",
        "**Impact** — share the effect on you, the team, or the work — not a judgement",
        "SBI separates the **person** from the **pattern** — that's what keeps doors open",
        "Skipping any step is the most common cause of feedback that **triggers defensiveness**",
      ],
      notes: notes({
        aim: "Build a shared mental model that the whole session hangs on.",
        time: "10 min",
        instructions:
          "Walk each letter with a real example. Pause after Impact — ask what the receiver might feel.",
        keyPoints: "Observation ≠ interpretation. SBI keeps you in observable reality.",
        linkToReality: "Compare to a GPS: you need coordinates (S), the route (B), and the destination (I).",
        debrief: "If they remember one thing: describe behaviour, share impact, skip the label.",
      }),
    },
    {
      id: "m-example",
      kind: "example",
      eyebrow: "Part 1 · Example in practice",
      title: "Turning vague frustration into a clear message",
      accent: "teal",
      bullets: [
        "Before SBI: *\"You've been really disengaged lately — it's affecting the team.\"*",
        "After SBI: *\"In Monday's stand-up [S], you left without updating your tasks [B]. The sprint board was incomplete and the team had to guess your status [I].\"*",
        "Same intent — completely different **effect on the receiver**",
      ],
      notes: notes({
        aim: "Make the model concrete by showing the before and after side by side.",
        time: "5 min",
        instructions:
          "Read both versions aloud in the same tone. Ask: which version would you rather receive?",
        keyPoints: "The second version is harder to argue with because it's factual.",
        linkToReality: "Invite someone to share an example of vague feedback they've received.",
        debrief: "The room will laugh at the 'before' version — that's the point.",
      }),
    },
    {
      id: "m-exercise",
      kind: "exercise",
      eyebrow: "Part 1 · Exercise",
      title: "Build your own SBI message",
      accent: "orange",
      bullets: [
        "Think of a **real situation** where you've been wanting to give feedback",
        "Write out your S, B, and I — one sentence each — without using adjectives",
        "Pair up: one person delivers, one receives, one observes and gives meta-feedback",
        "Rotate so everyone practises the **giving** and **receiving** roles",
      ],
      notes: notes({
        aim: "Apply the model to participants' real, live situations.",
        time: "20 min",
        instructions:
          "Triads work best. Give 5 min to write, 10 min to role-play, 5 min to debrief in triads.",
        keyPoints: "No invented scenarios — must use a real situation to feel the discomfort.",
        linkToReality: "",
        debrief: "Ask one triad to share what changed between their first attempt and their revised version.",
      }),
    },
    {
      id: "m-section2",
      kind: "section",
      eyebrow: "Part 2",
      title: "Receiving feedback well",
      subtitle: "the skill nobody teaches but everyone needs",
      accent: "rose",
      notes: notes({
        aim: "Shift attention from giving to receiving — often the harder half.",
        time: "30 sec",
        instructions: "Acknowledge that most training stops at giving — this part is different.",
        keyPoints: "Receiving is a leadership skill, not a passive act.",
        linkToReality: "",
        debrief: "Short divider — build anticipation.",
      }),
    },
    {
      id: "m-wrapup",
      kind: "wrapup",
      eyebrow: "Wrap up · Your commitment",
      title: "One conversation. This week.",
      accent: "teal",
      bullets: [
        "You can **name** why feedback stalls — and you know the fix",
        "You have a **SBI framework** that keeps conversations factual and safe",
        "You've **practised** giving and receiving in a real scenario",
        "Your next step: **write the first sentence** of the conversation you've been avoiding",
      ],
      notes: notes({
        aim: "Consolidate learning and lock in a specific, time-bound commitment.",
        time: "10 min",
        instructions:
          "Ask everyone to write one name and one first sentence on a card or sticky note. Pairs share.",
        keyPoints: "Specificity is everything — not 'I'll give more feedback' but 'I'll talk to Maya on Thursday.'",
        linkToReality: "Remind them: the SBI message they drafted in the exercise is already half a plan.",
        debrief: "Close on momentum — small, real, immediate. The card goes on their desk.",
      }),
    },
  ],
};

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
