import { useCallback, useEffect, useRef, useState } from "react";
import * as speechService from "../services/speech";
import { getProgressiveCaption, type WordTiming } from "../utils/wordTiming";
import type { Room } from "../types/property";

export interface TourNarration {
  /** Which room's narration is currently active (playing or paused) — independent of whichever room the visitor is looking at, since navigating rooms shouldn't cut off a narration already in progress. */
  activeRoomId: string | null;
  isSpeaking: boolean;
  isPaused: boolean;
  caption: string;
  /** Explicit "play this room" — interrupts whatever else is playing. */
  playRoom: (room: Room) => void;
  /** Play/pause button for a given room: toggles it if it's already the active one, otherwise starts it fresh (interrupting any other room's narration). */
  togglePlayPause: (room: Room) => void;
  stop: () => void;
}

/**
 * Tour-wide (not per-room) narration engine, so that navigating between
 * rooms — Previous/Next Room, the grid, etc. — never interrupts audio
 * already playing. Only an explicit play/pause tap, or the narration
 * finishing naturally, changes what's playing.
 *
 * `onRoomNaturallyFinished` fires with the id of whichever room just
 * finished on its own (not paused/interrupted) — the caller decides
 * whether that should auto-advance the view (only when the visitor is
 * still looking at the room that just finished; if they've already moved
 * on, yanking their view back would be jarring).
 */
export function useTourNarration(onRoomNaturallyFinished: (finishedRoomId: string) => void): TourNarration {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [caption, setCaption] = useState("");
  const wordsRef = useRef<WordTiming[]>([]);
  const rafRef = useRef<number | null>(null);
  const onFinishedRef = useRef(onRoomNaturallyFinished);

  useEffect(() => {
    onFinishedRef.current = onRoomNaturallyFinished;
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

  // Leaving the tour entirely (not just switching rooms) is the only time
  // this should stop — the empty dep array ties it to unmount only.
  useEffect(() => {
    return () => {
      speechService.stop();
      stopCaptionLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playRoom = useCallback(
    (room: Room) => {
      wordsRef.current = [];
      setCaption("");
      setActiveRoomId(room.id);
      speechService.speak(
        room.narration,
        () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCaption("");
          stopCaptionLoop();
          setActiveRoomId((current) => (current === room.id ? null : current));
          onFinishedRef.current(room.id);
        },
        (words) => {
          wordsRef.current = words;
        }
      );
      setIsSpeaking(true);
      setIsPaused(false);
      runCaptionLoop();
    },
    [runCaptionLoop, stopCaptionLoop]
  );

  const togglePlayPause = useCallback(
    (room: Room) => {
      if (!speechService.isSpeechSupported()) return;
      const isThisRoomActive = activeRoomId === room.id;
      if (isThisRoomActive && isSpeaking && !isPaused) {
        speechService.pause();
        setIsPaused(true);
        stopCaptionLoop();
      } else if (isThisRoomActive && isSpeaking && isPaused) {
        speechService.resume();
        setIsPaused(false);
        runCaptionLoop();
      } else {
        playRoom(room);
      }
    },
    [activeRoomId, isSpeaking, isPaused, playRoom, runCaptionLoop, stopCaptionLoop]
  );

  const stop = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCaption("");
    setActiveRoomId(null);
    stopCaptionLoop();
  }, [stopCaptionLoop]);

  return { activeRoomId, isSpeaking, isPaused, caption, playRoom, togglePlayPause, stop };
}
