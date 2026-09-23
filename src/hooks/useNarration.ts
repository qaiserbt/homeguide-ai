import { useCallback, useEffect, useRef, useState } from "react";
import * as speechService from "../services/speech";

/**
 * Drives play/pause/replay state for a single block of narration text,
 * backed by src/services/speech.ts. Audio never autostarts (section 9) —
 * the caller decides when to invoke play/togglePlayPause.
 */
export function useNarration(text: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    return () => {
      speechService.stop();
    };
  }, [text]);

  const play = useCallback(() => {
    speechService.speak(textRef.current, () => {
      setIsSpeaking(false);
      setIsPaused(false);
    });
    setIsSpeaking(true);
    setIsPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!speechService.isSpeechSupported()) return;
    if (isSpeaking && !isPaused) {
      speechService.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      speechService.resume();
      setIsPaused(false);
    } else {
      play();
    }
  }, [isSpeaking, isPaused, play]);

  const stopNarration = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return {
    isSpeaking,
    isPaused,
    play,
    togglePlayPause,
    replay: play,
    stop: stopNarration,
    supported: speechService.isSpeechSupported(),
  };
}
