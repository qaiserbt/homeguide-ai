export interface Env {
  PHOTOS: R2Bucket;
  ALLOWED_ORIGINS: string;
  PUBLIC_BUCKET_URL: string;
  OPENROUTER_MODEL: string;
  OPENROUTER_API_KEY: string;
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

function parseModelJson(raw: string): ExtractedListing | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") return parsed as ExtractedListing;
    return null;
  } catch {
    return null;
  }
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

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://qaiserbt.github.io/homeguide-ai/",
        "X-Title": "HomeGuide AI listing import",
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        response_format: { type: "json_object" },
        temperature: 0,
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
  } catch {
    return json({ error: "Couldn't reach the AI provider. Try again." }, 502, cors);
  }

  if (!response.ok) {
    return json({ error: `AI provider error (${response.status})` }, 502, cors);
  }

  const completion = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return json({ error: "AI provider returned an empty response" }, 502, cors);
  }

  const extracted = parseModelJson(content);
  if (!extracted) {
    return json({ error: "Couldn't parse the AI's response" }, 502, cors);
  }

  return json({ data: extracted }, 200, cors);
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
          usage: "POST multipart/form-data with a 'file' field to /upload, or JSON { text } to /extract-listing",
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

    return json({ error: "Not found" }, 404, cors);
  },
};
