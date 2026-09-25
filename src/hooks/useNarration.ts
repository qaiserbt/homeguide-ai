import { useCallback, useEffect, useRef, useState } from "react";
import * as speechService from "../services/speech";
import { chunkWordsIntoCaptions, findActiveChunkIndex, type CaptionChunk } from "../utils/captionChunks";

/**
 * Drives play/pause/replay state for a single block of narration text,
 * backed by src/services/speech.ts. Audio never autostarts (section 9) —
 * the caller decides when to invoke play/togglePlayPause. `onNaturalEnd`
 * fires only when the narration finishes on its own (not when paused or
 * interrupted) — useful for auto-advancing to the next room.
 *
 * `caption` tracks the currently-spoken phrase, synced to real playback
 * position via the word-level timings ElevenLabs returns — not just the
 * whole narration text shown for the full duration.
 */
export function useNarration(text: string, onNaturalEnd?: () => void) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [caption, setCaption] = useState("");
  const textRef = useRef(text);
  const onNaturalEndRef = useRef(onNaturalEnd);
  const chunksRef = useRef<CaptionChunk[]>([]);
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
      const chunks = chunksRef.current;
      if (chunks.length > 0) {
        const idx = findActiveChunkIndex(chunks, speechService.getCurrentTime());
        setCaption(chunks[idx]?.text ?? "");
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
    chunksRef.current = [];
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
        chunksRef.current = chunkWordsIntoCaptions(words);
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
