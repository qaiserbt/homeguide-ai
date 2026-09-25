/**
 * Sends an already-uploaded room photo's public URL to the Worker's
 * /analyze-room-photo endpoint, which calls a vision-capable LLM (via
 * OpenRouter — key lives only in the Worker) to describe what's visibly
 * in the photo. Results are a starting point for the agent to review and
 * edit, not ground truth — the model is instructed to only report what it
 * can actually see, not invent brand names or materials.
 */

const UPLOAD_ORIGIN = (import.meta.env.VITE_UPLOAD_API_URL ?? "https://homeguide-ai-uploads.fragrant-cake-acc5.workers.dev/upload").replace(
  /\/upload$/,
  ""
);

export interface RoomPhotoAnalysis {
  description: string;
  features: string[];
}

export async function analyzeRoomPhoto(imageUrl: string): Promise<RoomPhotoAnalysis> {
  let response: Response;
  try {
    response = await fetch(`${UPLOAD_ORIGIN}/analyze-room-photo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
  } catch {
    throw new Error("Couldn't reach the AI service. Check your connection and try again.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Photo analysis failed (${response.status})`);
  }

  const body = (await response.json()) as { data: RoomPhotoAnalysis };
  return body.data;
}
