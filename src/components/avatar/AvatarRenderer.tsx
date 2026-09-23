import { useState } from "react";
import { AvatarSVG } from "./AvatarSVG";
import { avatarImagePaths } from "../../data/avatarAssets";
import type { AvatarState } from "../../types/avatar";

interface AvatarRendererProps {
  state: AvatarState;
  className?: string;
}

/**
 * Decouples "what the avatar looks like" from "how it's rendered". Today
 * this tries a real image for the current state and falls back to the
 * built-in SVG character. Later this is the single place to swap in a
 * transparent WebM animation, a talking-head video, or a live streaming
 * avatar (section 31) without touching any calling component.
 */
export function AvatarRenderer({ state, className = "" }: AvatarRendererProps) {
  const src = avatarImagePaths[state];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return <AvatarSVG state={state} className={className} />;
  }

  return (
    <img
      key={src}
      src={src}
      alt="HomeGuide AI avatar"
      className={`${className} object-contain`}
      onError={() => setFailedSrc(src)}
    />
  );
}
