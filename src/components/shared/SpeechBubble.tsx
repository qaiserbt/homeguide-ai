import { Volume2, VolumeX } from "lucide-react";

interface SpeechBubbleProps {
  text: string;
  isSpeaking?: boolean;
  onToggleAudio?: () => void;
  className?: string;
}

export function SpeechBubble({ text, isSpeaking = false, onToggleAudio, className = "" }: SpeechBubbleProps) {
  return (
    <div
      className={`animate-slide-up relative rounded-2xl rounded-bl-sm bg-white/95 px-4 py-3 shadow-card-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <p className="text-sm leading-relaxed text-text-dark">{text}</p>
        {onToggleAudio && (
          <button
            type="button"
            onClick={onToggleAudio}
            aria-label={isSpeaking ? "Pause narration" : "Play narration"}
            aria-pressed={isSpeaking}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-transform active:scale-90 hover:bg-navy-light"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
