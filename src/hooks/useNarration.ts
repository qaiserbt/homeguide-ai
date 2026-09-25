import { useCallback, useEffect, useRef, useState } from "react";
import * as speechService from "../services/speech";
import { getProgressiveCaption, type WordTiming } from "../utils/wordTiming";

/**
 * Drives play/pause/replay state for a single block of narration text,
 * backed by src/services/speech.ts. Audio never autostarts (section 9) —
 * the caller decides when to invoke play/togglePlayPause. `onNaturalEnd`
 * fires only when the narration finishes on its own (not when paused or
 * interrupted) — useful for auto-advancing to the next room.
 *
 * `caption` builds up word-by-word as each one is actually spoken (using
 * ElevenLabs' word-level timings), staying within the current sentence
 * until it finishes, then clearing and starting the next one.
 */
export function useNarration(text: string, onNaturalEnd?: () => void) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [caption, setCaption] = useState("");
  const textRef = useRef(text);
  const onNaturalEndRef = useRef(onNaturalEnd);
  const wordsRef = useRef<WordTiming[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    onNaturalEndRef.current = onNaturalEnd;
  });

  const stopCaptionLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const runCaptionLoop = useCallback(() => {
    stopCaptionLoop();
    const tick = () => {
      const words = wordsRef.current;
      if (words.length > 0) {
        setCaption(getProgressiveCaption(words, speechService.getCurrentTime()));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopCaptionLoop]);

  useEffect(() => {
    textRef.current = text;
    return () => {
      speechService.stop();
      stopCaptionLoop();
    };
  }, [text, stopCaptionLoop]);

  const play = useCallback(() => {
    wordsRef.current = [];
    setCaption("");
    speechService.speak(
      textRef.current,
      () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCaption("");
        stopCaptionLoop();
        onNaturalEndRef.current?.();
      },
      (words) => {
        wordsRef.current = words;
      }
    );
    setIsSpeaking(true);
    setIsPaused(false);
    runCaptionLoop();
  }, [runCaptionLoop, stopCaptionLoop]);

  const togglePlayPause = useCallback(() => {
    if (!speechService.isSpeechSupported()) return;
    if (isSpeaking && !isPaused) {
      speechService.pause();
      setIsPaused(true);
      stopCaptionLoop();
    } else if (isSpeaking && isPaused) {
      speechService.resume();
      setIsPaused(false);
      runCaptionLoop();
    } else {
      play();
    }
  }, [isSpeaking, isPaused, play, runCaptionLoop, stopCaptionLoop]);

  const stopNarration = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCaption("");
    stopCaptionLoop();
  }, [stopCaptionLoop]);

  return {
    isSpeaking,
    isPaused,
    caption,
    play,
    togglePlayPause,
    replay: play,
    stop: stopNarration,
    supported: speechService.isSpeechSupported(),
  };
}
