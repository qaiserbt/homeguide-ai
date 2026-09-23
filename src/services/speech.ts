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

export function speak(text: string, onEnd?: EndListener): void {
  if (!supported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  utterance.onend = () => onEnd?.();

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
