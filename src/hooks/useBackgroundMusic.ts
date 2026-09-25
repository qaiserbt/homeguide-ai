import { useEffect, useRef, useState } from "react";

export interface BackgroundMusic {
  available: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

const NORMAL_VOLUME = 0.22;
const DUCKED_VOLUME = 0.06;

/**
 * A single looping background track for the whole tour, independent of
 * which room is being viewed or narrated. Starts muted — muted autoplay is
 * allowed by every browser without a user gesture, so the track is already
 * playing by the time someone taps the speaker icon to unmute it, instead
 * of that first tap having to both start AND unmute playback.
 *
 * `duck` (true while any room's narration is actively speaking) lowers the
 * volume so the voice guide stays clearly audible over the music.
 */
export function useBackgroundMusic(url: string | null, enabled: boolean, duck: boolean): BackgroundMusic {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // A new track/enabled state means a fresh Audio element (below), which
  // always starts muted — reset the mute-state UI to match during render,
  // rather than from inside the effect that creates it.
  const trackKey = `${url ?? ""}:${enabled}`;
  const [trackedKey, setTrackedKey] = useState(trackKey);
  if (trackKey !== trackedKey) {
    setTrackedKey(trackKey);
    setIsMuted(true);
  }

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
      /* even muted autoplay can occasionally be blocked — the toggle still works once the user interacts */
    });
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url, enabled]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = duck ? DUCKED_VOLUME : NORMAL_VOLUME;
  }, [duck]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
    if (!audio.muted) audio.play().catch(() => {});
  };

  return { available: Boolean(enabled && url), isMuted, toggleMute };
}
