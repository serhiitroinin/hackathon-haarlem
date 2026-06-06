import { type Deck } from "~/components/builder/types";
import { buildDeckPptx } from "~/lib/maverx/build-deck-pptx";

// pptxgenjs (zip + buffers) needs the Node runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { deck } = (await req.json()) as { deck: Deck };
  if (!deck?.slides?.length) {
    return Response.json({ error: "Empty deck" }, { status: 400 });
  }
  const buf = await buildDeckPptx(deck);
  const filename =
    (deck.title || "maverx-deck")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) + ".pptx";

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
