/**
 * Sends listing text (already extracted from a PDF client-side, see
 * services/pdfExtract.ts) to the Worker's /extract-listing endpoint, which
 * calls an LLM (via OpenRouter — key lives only in the Worker) to pull out
 * structured property facts. The model is instructed to never invent
 * values, so every field here may come back null/empty if not stated in
 * the source text — callers must treat this as a draft for the agent to
 * review, not ground truth.
 */

const UPLOAD_ORIGIN = (import.meta.env.VITE_UPLOAD_API_URL ?? "https://homeguide-ai-uploads.fragrant-cake-acc5.workers.dev/upload").replace(
  /\/upload$/,
  ""
);

export interface ExtractedListing {
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  propertyType: string | null;
  description: string | null;
  taxAmount: number | null;
  taxYear: number | null;
  parkingType: string | null;
  parkingSpaces: number | null;
  basementFinished: boolean | null;
  basementSeparateEntrance: boolean | null;
  features: string[];
}

export async function extractListingFromText(text: string): Promise<ExtractedListing> {
  let response: Response;
  try {
    response = await fetch(`${UPLOAD_ORIGIN}/extract-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new Error("Couldn't reach the AI import service. Check your connection and try again.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Import failed (${response.status})`);
  }

  const body = (await response.json()) as { data: ExtractedListing };
  return body.data;
}
