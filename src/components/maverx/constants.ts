import {
  BookOpen,
  Clock,
  Layers,
  Target,
  Users,
} from "lucide-react";

export const INTAKE_STEPS = [
  {
    id: "topic" as const,
    label: "Topic",
    description: "What skill or subject to train",
    icon: BookOpen,
    patterns: [/\btopic\b/i, /\bskill\b/i, /\btraining on\b/i, /\babout\b/i],
  },
  {
    id: "audience" as const,
    label: "Audience",
    description: "Who are the participants",
    icon: Users,
    patterns: [/\baudience\b/i, /\bparticipants\b/i, /\bteam\b/i, /\bpeople\b/i, /\bwho\b/i],
  },
  {
    id: "level" as const,
    label: "Knowledge level",
    description: "Beginner, intermediate, or advanced",
    icon: Layers,
    patterns: [/\bbeginner\b/i, /\bintermediate\b/i, /\badvanced\b/i, /\blevel\b/i, /\bexperience\b/i],
  },
  {
    id: "duration" as const,
    label: "Duration",
    description: "How long is the training session",
    icon: Clock,
    optional: true,
    patterns: [/\bhour\b/i, /\bminute\b/i, /\blong\b/i, /\bduration\b/i, /\btime\b/i, /\b\d+h\b/i],
  },
  {
    id: "objective" as const,
    label: "Learning objective",
    description: "The primary outcome participants achieve",
    icon: Target,
    optional: true,
    patterns: [/\bobjective\b/i, /\bgoal\b/i, /\boutcome\b/i, /\blearn\b/i, /\bable to\b/i],
  },
] as const;

export const DIDACTIC_BLOCKS = [
  { block: "Kick-off", desc: "Goals & agenda" },
  { block: "Theory", desc: "Core concepts" },
  { block: "Example", desc: "Concrete illustration" },
  { block: "Exercise", desc: "Active application" },
  { block: "Wrap-up", desc: "Takeaways & next steps" },
] as const;

export const DELIVERABLES = [
  "Editable .pptx in Maverx house style",
  "Speaker notes on every slide (5 fields)",
  "Pre-bite preparation document",
  "Post-bite follow-up document",
] as const;
