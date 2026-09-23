/**
 * Photo upload service. Uploads go to a Cloudflare Worker backed by R2
 * object storage (see /worker) and come back as a public URL that can be
 * stored directly on a Property/Room. No API keys live in this file or
 * anywhere in the frontend — the Worker itself holds the R2 binding.
 */

const UPLOAD_ENDPOINT =
  import.meta.env.VITE_UPLOAD_API_URL ?? "https://homeguide-ai-uploads.fragrant-cake-acc5.workers.dev/upload";

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  let response: Response;
  try {
    response = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: form });
  } catch {
    throw new Error("Couldn't reach the upload server. Check your connection and try again.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Upload failed (${response.status})`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
