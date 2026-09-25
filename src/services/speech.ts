/**
 * Text-to-speech service. Uses a premium ElevenLabs voice via a Cloudflare
 * Worker endpoint (/synthesize-speech), which caches generated audio in R2
 * keyed by text so repeat plays never re-bill ElevenLabs. Callers only
 * depend on speak/pause/resume/stop/onEnd/getCurrentTime, never on the
 * underlying mechanism — this file is the one place that would change
 * again if the voice provider changes.
 */
import type { WordTiming } from "../utils/wordTiming";

type EndListener = () => void;
type WordsListener = (words: WordTiming[]) => void;

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

// Fetching + resolving the audio is async, so a stop() or a newer speak()
// call can land while an earlier one is still in flight. Each speak() call
// checks its token is still current before actually starting playback, so
// a superseded call never starts talking after the fact.
let speakToken = 0;

interface ResolvedAudio {
  url: string;
  words: WordTiming[];
}

// Same text is requested repeatedly (replays, revisits) — avoid hitting the
// Worker/R2 again for data we already resolved this session.
const audioCache = new Map<string, ResolvedAudio>();

async function resolveAudio(text: string): Promise<ResolvedAudio> {
  const cached = audioCache.get(text);
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

  const body = (await response.json()) as { url: string; words?: WordTiming[] };
  const resolved: ResolvedAudio = { url: body.url, words: body.words ?? [] };
  audioCache.set(text, resolved);
  return resolved;
}

export function speak(text: string, onEnd?: EndListener, onWords?: WordsListener): void {
  if (!supported() || !text.trim()) return;

  const myToken = ++speakToken;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  resolveAudio(text)
    .then(({ url, words }) => {
      if (myToken !== speakToken) return; // superseded while resolving

      onWords?.(words);

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

/** Current playback position in seconds — used to sync captions to speech. */
export function getCurrentTime(): number {
  return currentAudio?.currentTime ?? 0;
}
