import { extractFromFile } from "~/lib/extract";
import { db } from "~/server/db";

// Extraction (pdf.js) + Prisma need the Node runtime, not edge.
export const runtime = "nodejs";
export const maxDuration = 60;

// Guard rails for a hackathon demo: cap per-file size so a giant PDF can't OOM
// the small Fly VM. 20 MB is plenty for slides/papers.
const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Accepts a multipart form with one or more `files`, extracts text from each,
 * and stores them as Source rows. Returns the created sources (no full text) so
 * the client can render them immediately.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const projectId = form.get("projectId");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (typeof projectId !== "string" || !projectId) {
    return Response.json({ error: "Missing projectId" }, { status: 400 });
  }
  if (files.length === 0) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  // Make sure the project exists before attaching anything to it.
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const created = [];
  const errors: { name: string; error: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      errors.push({ name: file.name, error: "File too large (max 20 MB)" });
      continue;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { kind, text } = await extractFromFile({
        name: file.name,
        type: file.type,
        bytes,
      });

      const source = await db.source.create({
        data: {
          projectId,
          name: file.name,
          kind,
          mimeType: file.type || "application/octet-stream",
          bytes: file.size,
          text,
          chars: text.length,
        },
        select: {
          id: true,
          name: true,
          kind: true,
          mimeType: true,
          bytes: true,
          chars: true,
          createdAt: true,
        },
      });
      created.push(source);
    } catch (err) {
      errors.push({
        name: file.name,
        error: err instanceof Error ? err.message : "Extraction failed",
      });
    }
  }

  return Response.json({ created, errors });
}
