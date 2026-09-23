export interface Env {
  PHOTOS: R2Bucket;
  ALLOWED_ORIGINS: string;
  PUBLIC_BUCKET_URL: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
          usage: "POST multipart/form-data with a 'file' field to /upload",
        },
        200,
        cors
      );
    }

    if (url.pathname !== "/upload" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }

    // Origin-header check only stops naive/browser-driven abuse, not a
    // determined attacker forging headers directly — real protection
    // requires admin authentication, which this app doesn't have yet.
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed" }, 403, cors);
    }

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
  },
};
