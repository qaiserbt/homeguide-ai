/**
 * Text-to-speech service. MVP implementation uses the browser
 * SpeechSynthesis API, with the best-sounding available system voice
 * picked automatically. Swap the internals of this file for a premium
 * voice API (e.g. ElevenLabs) later — callers only depend on speak/pause/
 * resume/stop/onEnd, never on SpeechSynthesis directly.
 */

type EndListener = () => void;

function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechSupported(): boolean {
  return supported();
}

// The Web Speech API fires `onend` both when an utterance finishes naturally
// AND when it's cancelled (e.g. by calling speak() again or stop()), with no
// reliable way to tell the two apart from the event itself. We track whether
// the in-flight cancel was intentional so callers only hear about genuine
// completions — needed for features like auto-advancing to the next room.
let suppressNextEnd = false;

// Voice resolution is async (see resolveVoice), so a speak() call can still
// be waiting on it when a newer speak()/stop() supersedes it. Each speak()
// captures the current token and checks it's still current before actually
// starting — otherwise a stale call could start speaking after a stop().
let speakToken = 0;

// Chrome (and others) often return an empty voice list on the very first
// call — the real list only arrives once, asynchronously, via the
// `voiceschanged` event. Voices are also the same across every utterance,
// so we resolve the choice once and reuse it.
let cachedVoice: SpeechSynthesisVoice | null | undefined;

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    // Some browsers never fire voiceschanged if voices were already ready —
    // don't hang forever waiting.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

// Ranked by how natural they sound, not just availability. Chrome's "Google"
// network voices and modern OS "Natural"/"Online (Natural)" voices sound
// meaningfully less robotic than the classic default system voices.
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Google UK English Female",
  "Microsoft Ava Online (Natural) - English (United States)",
  "Microsoft Andrew Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Samantha",
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  for (const name of PREFERRED_VOICE_NAMES) {
    const exact = voices.find((v) => v.name === name);
    if (exact) return exact;
  }

  const naturalSounding = voices.find((v) => /natural|neural|online/i.test(v.name) && v.lang.startsWith("en"));
  if (naturalSounding) return naturalSounding;

  return voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
}

async function resolveVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = await getVoicesAsync();
  cachedVoice = pickBestVoice(voices);
  return cachedVoice;
}

export function speak(text: string, onEnd?: EndListener): void {
  if (!supported()) return;

  // Cancel whatever's in flight immediately — don't let async voice
  // resolution delay this, or a stop() racing a first-ever speak() call
  // could be silently undone once that call's utterance finally starts.
  suppressNextEnd = true;
  window.speechSynthesis.cancel();
  const myToken = ++speakToken;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1.02;
  utterance.volume = 1;

  utterance.onstart = () => {
    suppressNextEnd = false;
  };
  utterance.onend = () => {
    if (suppressNextEnd) return;
    onEnd?.();
  };

  resolveVoice().then((voice) => {
    if (myToken !== speakToken) return; // superseded by a newer speak()/stop() while resolving
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  });
}

export function pause(): void {
  if (!supported()) return;
  if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
}

export function resume(): void {
  if (!supported()) return;
  window.speechSynthesis.resume();
}

export function stop(): void {
  if (!supported()) return;
  suppressNextEnd = true;
  speakToken++;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (!supported()) return false;
  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  if (!supported()) return false;
  return window.speechSynthesis.paused;
}
