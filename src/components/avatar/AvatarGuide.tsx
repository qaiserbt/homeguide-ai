import { AvatarRenderer } from "./AvatarRenderer";
import { SpeechBubble } from "../shared/SpeechBubble";
import type { AvatarState, AvatarSize, AvatarPosition } from "../../types/avatar";

interface AvatarGuideProps {
  state: AvatarState;
  size?: AvatarSize;
  position?: AvatarPosition;
  /** Optional compact speech bubble rendered next to the avatar. */
  message?: string;
  isSpeaking?: boolean;
  onToggleAudio?: () => void;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-16 h-16",
  md: "w-28 h-28 sm:w-32 sm:h-32",
  lg: "w-44 h-44 sm:w-52 sm:h-52",
  xl: "w-60 h-60 sm:w-72 sm:h-72",
};

const positionClasses: Record<AvatarPosition, string> = {
  center: "relative mx-auto",
  "bottom-left": "absolute left-4 bottom-4 sm:left-8 sm:bottom-8",
  "bottom-right": "absolute right-4 bottom-4 sm:right-8 sm:bottom-8",
  top: "relative mx-auto",
  inline: "relative",
};

/**
 * The Home Guide character. Purely presentational: pass `state` to reflect
 * what's happening (welcome / explaining / listening / thinking / speaking
 * / pointing). Rendering itself is delegated to AvatarRenderer so the
 * visual source (SVG placeholder today, image/video later) stays swappable.
 */
export function AvatarGuide({
  state,
  size = "md",
  position = "inline",
  message,
  isSpeaking = false,
  onToggleAudio,
  className = "",
}: AvatarGuideProps) {
  return (
    <div className={`${positionClasses[position]} ${className} flex items-end gap-3`}>
      <div className="relative shrink-0 animate-float">
        {isSpeaking && (
          <span className="absolute inset-0 -m-1.5 rounded-full bg-gold/30 animate-pulse-soft" />
        )}
        <div
          className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-b from-white/40 to-transparent p-1 shadow-card-lg`}
        >
          <div className="h-full w-full overflow-hidden rounded-full bg-offwhite">
            <AvatarRenderer state={state} className="h-full w-full" />
          </div>
        </div>
      </div>
      {message && (
        <SpeechBubble
          text={message}
          isSpeaking={isSpeaking}
          onToggleAudio={onToggleAudio}
          className="mb-2 max-w-xs"
        />
      )}
    </div>
  );
}
