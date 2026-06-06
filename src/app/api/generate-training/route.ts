import { NextResponse } from "next/server";

import { generateTrainingFiles } from "~/lib/maverx/pipeline";
import { intakeSchema } from "~/lib/maverx/schema";

// pptx-automizer + filesystem writes need the Node runtime, not edge.
export const runtime = "nodejs";
// Content generation + deck build can take a while; allow headroom.
export const maxDuration = 120;

/** Direct generation endpoint — handy for testing without the chat. */
export async function POST(req: Request) {
  const body: unknown = await req.json();
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid intake", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await generateTrainingFiles(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
