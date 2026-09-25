import { useEffect, useRef } from "react";

export interface BackgroundMusic {
  available: boolean;
  /** Unmutes and (re)starts playback if needed — safe to call every time,
   * even when already audible. Call it from inside a real user gesture
   * (a click handler), since unmuting requires one the first time. */
  ensureAudible: () => void;
}

const NORMAL_VOLUME = 0.22;
const DUCKED_VOLUME = 0.06;

/**
 * A single looping background track for the whole tour, independent of
 * which room is being viewed or narrated. Starts muted (browsers only
 * allow autoplay-with-sound inside a genuine user gesture) and stays that
 * way until `ensureAudible()` is called — the caller wires that into
 * whatever already counts as a user gesture (pressing Play on the
 * narration), so no separate mute toggle is needed. Once unmuted it just
 * keeps playing for the rest of the session.
 *
 * `duck` (true while any room's narration is actively speaking) lowers the
 * volume so the voice guide stays clearly audible over the music.
 */
export function useBackgroundMusic(url: string | null, enabled: boolean, duck: boolean): BackgroundMusic {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || !url) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }
    const audio = new Audio(url);
    audio.loop = true;
    audio.muted = true;
    audio.volume = NORMAL_VOLUME;
    audioRef.current = audio;
    audio.play().catch(() => {
      /* even muted autoplay can occasionally be blocked — ensureAudible still works once the user interacts */
    });
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url, enabled]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = duck ? DUCKED_VOLUME : NORMAL_VOLUME;
  }, [duck]);

  const ensureAudible = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted) audio.muted = false;
    if (audio.paused) audio.play().catch(() => {});
  };

  return { available: Boolean(enabled && url), ensureAudible };
}
