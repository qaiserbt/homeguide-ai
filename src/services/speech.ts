/**
 * Text-to-speech service. MVP implementation uses the browser
 * SpeechSynthesis API. Swap the internals of this file for a premium voice
 * API (e.g. ElevenLabs) later — callers only depend on speak/pause/resume/
 * stop/onEnd, never on SpeechSynthesis directly.
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

export function speak(text: string, onEnd?: EndListener): void {
  if (!supported()) return;

  suppressNextEnd = true;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  utterance.onstart = () => {
    suppressNextEnd = false;
  };
  utterance.onend = () => {
    if (suppressNextEnd) return;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
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
