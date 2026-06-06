import "server-only";

/**
 * Document extraction for the first screen. Turns an uploaded file into plain
 * text we can persist and later feed to the model as context.
 *
 * - PDF  -> text via `unpdf` (a serverless build of pdf.js — no native deps, so
 *           it works inside the Fly Docker image and on the edge alike).
 * - text/markdown/csv/json -> decoded as UTF-8.
 * - images -> no OCR here; we keep the file metadata and let the vision model
 *             read the bytes in chat. `text` stays empty.
 */

export type SourceKind = "pdf" | "image" | "text";

export type Extraction = {
  kind: SourceKind;
  text: string;
  /** Pages for PDFs, undefined otherwise. */
  pages?: number;
};

export function kindForMime(mime: string, name: string): SourceKind {
  const lower = name.toLowerCase();
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  return "text";
}

/** Texty mime types / extensions we decode directly. */
function looksTextual(mime: string, name: string): boolean {
  if (mime.startsWith("text/")) return true;
  if (/(json|xml|csv|markdown|yaml|x-yaml|javascript|typescript)/.test(mime))
    return true;
  return /\.(txt|md|markdown|csv|tsv|json|ya?ml|html?|rtf|log)$/i.test(name);
}

/** Extract text from a single uploaded file. Never throws — returns best effort. */
export async function extractFromFile(file: {
  name: string;
  type: string;
  bytes: Uint8Array;
}): Promise<Extraction> {
  const kind = kindForMime(file.type, file.name);

  if (kind === "pdf") {
    try {
      // Imported lazily so the heavy pdf.js bundle only loads when a PDF arrives.
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(file.bytes);
      const { text, totalPages } = await extractText(pdf, { mergePages: true });
      return { kind, text: normalize(text), pages: totalPages };
    } catch (err) {
      return {
        kind,
        text: `[Could not extract text from PDF "${file.name}": ${
          err instanceof Error ? err.message : String(err)
        }]`,
      };
    }
  }

  if (kind === "image") {
    // We don't OCR images; the chat passes the raw bytes to the vision model.
    return { kind, text: "" };
  }

  // Textual: decode whatever we got, even if the mime is generic.
  if (looksTextual(file.type, file.name) || file.type === "") {
    try {
      const text = new TextDecoder("utf-8", { fatal: false }).decode(file.bytes);
      return { kind: "text", text: normalize(text) };
    } catch {
      return { kind: "text", text: "" };
    }
  }

  // Unknown binary — try a UTF-8 decode as a last resort.
  const text = new TextDecoder("utf-8", { fatal: false }).decode(file.bytes);
  return { kind: "text", text: normalize(text) };
}

/** Collapse excessive whitespace so stored context stays compact. */
function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
