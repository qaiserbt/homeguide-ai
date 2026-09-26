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

// A single, reused <audio> element for the whole session rather than a new
// Audio() per line. iOS Safari only allows autoplay-with-sound on an
// element that's already been "unlocked" by a prior gesture-triggered
// play() — reassigning .src on that same element and calling .play() again
// later (e.g. from the auto-advance timer, with no fresh gesture) still
// works, but a brand-new Audio() instance in that same spot gets silently
// blocked. The very first speak() call (from the user's own tap) unlocks
// this element for the rest of the session.
let sharedAudio: HTMLAudioElement | null = null;
function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio();
  return sharedAudio;
}

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
  const audio = getSharedAudio();
  audio.pause();
  audio.onended = null;

  resolveAudio(text)
    .then(({ url, words }) => {
      if (myToken !== speakToken) return; // superseded while resolving

      onWords?.(words);

      audio.src = url;
      audio.onended = () => {
        if (myToken === speakToken) onEnd?.();
      };
      // Autoplay-with-sound on a brand-new element would be blocked without
      // a recent user gesture (e.g. the auto-advance chain calling this
      // from a timer) — reusing the one shared, already-unlocked element is
      // what makes this succeed anyway. Still fails silently rather than
      // throwing on the rare case it doesn't.
      audio.play().catch(() => {});
    })
    .catch(() => {
      // Network/API failure — degrade silently, matching the rest of this
      // app's pattern of never blocking the tour on a backend hiccup.
    });
}

export function pause(): void {
  sharedAudio?.pause();
}

export function resume(): void {
  sharedAudio?.play().catch(() => {});
}

export function stop(): void {
  speakToken++;
  if (sharedAudio) {
    sharedAudio.pause();
    sharedAudio.onended = null;
  }
}

export function isSpeaking(): boolean {
  return Boolean(sharedAudio && sharedAudio.src && !sharedAudio.paused && !sharedAudio.ended);
}

export function isPaused(): boolean {
  return Boolean(sharedAudio && sharedAudio.src && sharedAudio.paused && !sharedAudio.ended);
}

/** Current playback position in seconds — used to sync captions to speech. */
export function getCurrentTime(): number {
  return sharedAudio?.currentTime ?? 0;
}
