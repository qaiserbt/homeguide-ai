/**
 * Text-to-speech service. Uses a premium ElevenLabs voice via a Cloudflare
 * Worker endpoint (/synthesize-speech), which caches generated audio in R2
 * keyed by text so repeat plays never re-bill ElevenLabs. Callers only
 * depend on speak/pause/resume/stop/onEnd, never on the underlying
 * mechanism — this file is the one place that would change again if the
 * voice provider changes.
 */

type EndListener = () => void;

const UPLOAD_ORIGIN = (
  import.meta.env.VITE_UPLOAD_API_URL ?? "https://homeguide-ai-uploads.fragrant-cake-acc5.workers.dev/upload"
).replace(/\/upload$/, "");

function supported(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

export function isSpeechSupported(): boolean {
  return supported();
}

let currentAudio: HTMLAudioElement | null = null;

// Fetching + resolving the audio URL is async, so a stop() or a newer
// speak() call can land while an earlier one is still in flight. Each
// speak() call checks its token is still current before actually starting
// playback, so a superseded call never starts talking after the fact.
let speakToken = 0;

// Same text is requested repeatedly (replays, revisits) — avoid hitting the
// Worker/R2 again for a URL we already resolved this session.
const audioUrlCache = new Map<string, string>();

async function resolveAudioUrl(text: string): Promise<string> {
  const cached = audioUrlCache.get(text);
  if (cached) return cached;

  const response = await fetch(`${UPLOAD_ORIGIN}/synthesize-speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Speech synthesis failed (${response.status})`);
  }

  const body = (await response.json()) as { url: string };
  audioUrlCache.set(text, body.url);
  return body.url;
}

export function speak(text: string, onEnd?: EndListener): void {
  if (!supported() || !text.trim()) return;

  const myToken = ++speakToken;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  resolveAudioUrl(text)
    .then((url) => {
      if (myToken !== speakToken) return; // superseded while resolving

      const audio = new Audio(url);
      audio.onended = () => {
        if (myToken === speakToken) onEnd?.();
      };
      currentAudio = audio;
      // Autoplay can be blocked without a recent user gesture (e.g. the
      // auto-advance chain calling this from a timer) — fail silently
      // rather than throw; the UI's play/pause state just won't progress.
      audio.play().catch(() => {});
    })
    .catch(() => {
      // Network/API failure — degrade silently, matching the rest of this
      // app's pattern of never blocking the tour on a backend hiccup.
    });
}

export function pause(): void {
  currentAudio?.pause();
}

export function resume(): void {
  currentAudio?.play().catch(() => {});
}

export function stop(): void {
  speakToken++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isSpeaking(): boolean {
  return Boolean(currentAudio && !currentAudio.paused && !currentAudio.ended);
}

export function isPaused(): boolean {
  return Boolean(currentAudio && currentAudio.paused && !currentAudio.ended);
}
