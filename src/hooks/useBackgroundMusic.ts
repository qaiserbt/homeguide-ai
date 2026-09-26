import { useEffect, useRef } from "react";

export interface BackgroundMusic {
  available: boolean;
  /** Starts (or resumes) the track — call this from inside a real user
   * gesture (a click handler), since browsers only allow starting audio
   * with sound as a direct result of one. */
  play: () => void;
  /** Pauses the track. Always safe to call — pausing never needs a gesture. */
  pause: () => void;
}

const MUSIC_VOLUME = 0.04;

/**
 * A single looping background track, playing only while narration is
 * actually speaking (quietly, under the voice) — silent the instant
 * narration is paused, stopped, or hasn't started, so it never plays on
 * its own. The caller (TourLayout) wires `play`/`pause` into the exact
 * moments narration starts/stops, since that's the only reliable way to
 * stay inside the user-gesture window autoplay requires.
 */
export function useBackgroundMusic(url: string | null, enabled: boolean): BackgroundMusic {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || !url) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = MUSIC_VOLUME;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url, enabled]);

  const play = () => {
    audioRef.current?.play().catch(() => {
      /* blocked (e.g. this wasn't actually inside a gesture) — narration still plays fine either way */
    });
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  return { available: Boolean(enabled && url), play, pause };
}
