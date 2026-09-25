export interface Env {
  PHOTOS: R2Bucket;
  ALLOWED_ORIGINS: string;
  PUBLIC_BUCKET_URL: string;
  OPENROUTER_MODEL: string;
  OPENROUTER_API_KEY: string;
  ELEVENLABS_VOICE_ID: string;
  ELEVENLABS_API_KEY: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_LISTING_TEXT_CHARS = 60_000;

function isAllowedOrigin(origin: string | null, env: Env): boolean {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  return Boolean(origin && allowed.includes(origin));
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

async function handleUpload(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart/form-data" }, 400, cors);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ error: "Missing 'file' field" }, 400, cors);
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return json({ error: `Unsupported file type: ${file.type}` }, 415, cors);
  }

  if (file.size > MAX_FILE_BYTES) {
    return json({ error: "File exceeds 10MB limit" }, 413, cors);
  }

  const key = `${crypto.randomUUID()}.${extension}`;
  await env.PHOTOS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return json({ url: `${env.PUBLIC_BUCKET_URL}/${key}` }, 201, cors);
}

const EXTRACTION_SYSTEM_PROMPT = `You are a real estate listing data-extraction assistant.

You will be given raw text extracted from a property listing PDF (an MLS sheet, brochure, or similar). Extract ONLY facts that are explicitly stated in the text. Do not guess, estimate, infer, or fabricate any value. If a field is not clearly and explicitly present in the text, set it to null (or an empty array for list fields).

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "address": string | null,
  "city": string | null,
  "province": string | null,
  "postalCode": string | null,
  "price": number | null,
  "bedrooms": number | null,
  "bathrooms": number | null,
  "squareFeet": number | null,
  "propertyType": string | null,
  "description": string | null,
  "taxAmount": number | null,
  "taxYear": number | null,
  "parkingType": string | null,
  "parkingSpaces": number | null,
  "basementFinished": boolean | null,
  "basementSeparateEntrance": boolean | null,
  "features": string[]
}

"features" should be short phrases for notable amenities explicitly mentioned (e.g. "Quartz Countertops", "Finished Basement", "Double Car Garage") — omit anything not clearly stated. "description" should be a short 1-3 sentence factual summary built only from stated facts, not marketing flourish you invent.`;

interface ExtractedListing {
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

function parseModelJson<T>(raw: string): T | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") return parsed as T;
    return null;
  } catch {
    return null;
  }
}

interface OpenRouterMessage {
  role: "system" | "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

async function callOpenRouter(env: Env, messages: OpenRouterMessage[]): Promise<{ content: string } | { error: string; status: number }> {
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://qaiserbt.github.io/homeguide-ai/",
        "X-Title": "HomeGuide AI",
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        response_format: { type: "json_object" },
        temperature: 0,
        messages,
      }),
    });
  } catch {
    return { error: "Couldn't reach the AI provider. Try again.", status: 502 };
  }

  if (!response.ok) {
    return { error: `AI provider error (${response.status})`, status: 502 };
  }

  const completion = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return { error: "AI provider returned an empty response", status: 502 };
  }

  return { content };
}

async function handleExtractListing(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  if (!env.OPENROUTER_API_KEY) {
    return json({ error: "Listing import isn't configured yet (missing API key)." }, 503, cors);
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body with a 'text' field" }, 400, cors);
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return json({ error: "Missing 'text' field" }, 400, cors);
  }

  const text = body.text.slice(0, MAX_LISTING_TEXT_CHARS);

  const result = await callOpenRouter(env, [
    { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
    { role: "user", content: text },
  ]);
  if ("error" in result) return json({ error: result.error }, result.status, cors);

  const extracted = parseModelJson<ExtractedListing>(result.content);
  if (!extracted) {
    return json({ error: "Couldn't parse the AI's response" }, 502, cors);
  }

  return json({ data: extracted }, 200, cors);
}

const ROOM_PHOTO_SYSTEM_PROMPT = `You are a real estate photography analyst helping an agent write listing copy.

Look at the provided room photo and describe ONLY what is visibly, clearly present in the image. Do not invent specific brand names, exact materials, or measurements you cannot actually see — if you're not sure a countertop is quartz, just don't mention the material. Do not assume facts about the rest of the home from one photo.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "description": string,
  "features": string[]
}

"description" is a short, factual 1-2 sentence visual description of the room. "features" is a list of 3-8 short phrases for notable things clearly visible in the photo (e.g. "Hardwood Flooring", "Large Windows", "Built-in Shelving", "Fireplace", "Neutral Décor", "Area Rug") — only include what you can actually see.`;

interface RoomPhotoAnalysis {
  description: string;
  features: string[];
}

async function handleAnalyzeRoomPhoto(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  if (!env.OPENROUTER_API_KEY) {
    return json({ error: "Photo analysis isn't configured yet (missing API key)." }, 503, cors);
  }

  let body: { imageUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body with an 'imageUrl' field" }, 400, cors);
  }

  if (typeof body.imageUrl !== "string" || !body.imageUrl.trim()) {
    return json({ error: "Missing 'imageUrl' field" }, 400, cors);
  }

  const result = await callOpenRouter(env, [
    { role: "system", content: ROOM_PHOTO_SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze this room photo." },
        { type: "image_url", image_url: { url: body.imageUrl } },
      ],
    },
  ]);
  if ("error" in result) return json({ error: result.error }, result.status, cors);

  const parsed = parseModelJson<RoomPhotoAnalysis>(result.content);
  if (!parsed || !Array.isArray(parsed.features)) {
    return json({ error: "Couldn't parse the AI's response" }, 502, cors);
  }

  return json({ data: parsed }, 200, cors);
}

const MAX_SPEECH_TEXT_CHARS = 2_500;

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface WordTiming {
  text: string;
  start: number;
  end: number;
}

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

/** Derives word-level timings from ElevenLabs' character-level alignment. */
function deriveWordTimings(alignment: ElevenLabsAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  let current = "";
  let start: number | null = null;

  for (let i = 0; i < alignment.characters.length; i++) {
    const ch = alignment.characters[i];
    if (/\s/.test(ch)) {
      if (current) {
        words.push({ text: current, start: start ?? 0, end: alignment.character_end_times_seconds[i - 1] });
        current = "";
        start = null;
      }
      continue;
    }
    if (start === null) start = alignment.character_start_times_seconds[i];
    current += ch;
  }
  if (current) {
    const lastIndex = alignment.characters.length - 1;
    words.push({ text: current, start: start ?? 0, end: alignment.character_end_times_seconds[lastIndex] });
  }
  return words;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function handleSynthesizeSpeech(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  if (!env.ELEVENLABS_API_KEY) {
    return json({ error: "Voice synthesis isn't configured yet (missing API key)." }, 503, cors);
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected JSON body with a 'text' field" }, 400, cors);
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return json({ error: "Missing 'text' field" }, 400, cors);
  }

  const text = body.text.trim().slice(0, MAX_SPEECH_TEXT_CHARS);

  // Narration text rarely changes, so cache the generated audio (+ word
  // timings, for caption sync) in R2 keyed by a hash of (voice, text) —
  // repeat plays of the same line, by the same visitor or a different one,
  // are served straight from R2 and never touch ElevenLabs again (no
  // credits spent past the first synthesis).
  const hash = await sha256Hex(`${env.ELEVENLABS_VOICE_ID}:${text}`);
  const audioKey = `audio/${hash}.mp3`;
  const timingKey = `audio/${hash}.json`;

  const existingTiming = await env.PHOTOS.get(timingKey);
  if (existingTiming) {
    const existingAudio = await env.PHOTOS.head(audioKey);
    if (existingAudio) {
      const words = await existingTiming.json<WordTiming[]>();
      return json({ url: `${env.PUBLIC_BUCKET_URL}/${audioKey}`, words, cached: true }, 200, cors);
    }
  }
  // Falls through to regenerate if either file is missing — e.g. audio
  // cached before timing support existed, self-healing on next request.

  let response: Response;
  try {
    response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}/with-timestamps`, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
  } catch {
    return json({ error: "Couldn't reach the voice provider. Try again." }, 502, cors);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return json({ error: `Voice provider error (${response.status})`, detail: detail.slice(0, 300) }, 502, cors);
  }

  const data = (await response.json()) as { audio_base64: string; alignment: ElevenLabsAlignment };
  const audioBytes = base64ToBytes(data.audio_base64);
  const words = deriveWordTimings(data.alignment);

  await env.PHOTOS.put(audioKey, audioBytes, { httpMetadata: { contentType: "audio/mpeg" } });
  await env.PHOTOS.put(timingKey, JSON.stringify(words), { httpMetadata: { contentType: "application/json" } });

  return json({ url: `${env.PUBLIC_BUCKET_URL}/${audioKey}`, words, cached: false }, 200, cors);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return json(
        {
          service: "homeguide-ai-uploads",
          status: "ok",
          usage:
            "POST multipart/form-data with a 'file' field to /upload, JSON { text } to /extract-listing or /synthesize-speech, or JSON { imageUrl } to /analyze-room-photo",
        },
        200,
        cors
      );
    }

    // Origin-header check only stops naive/browser-driven abuse, not a
    // determined attacker forging headers directly — real protection
    // requires admin authentication, which this app doesn't have yet.
    if (request.method === "POST" && !isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed" }, 403, cors);
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      return handleUpload(request, env, cors);
    }

    if (url.pathname === "/extract-listing" && request.method === "POST") {
      return handleExtractListing(request, env, cors);
    }

    if (url.pathname === "/analyze-room-photo" && request.method === "POST") {
      return handleAnalyzeRoomPhoto(request, env, cors);
    }

    if (url.pathname === "/synthesize-speech" && request.method === "POST") {
      return handleSynthesizeSpeech(request, env, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
