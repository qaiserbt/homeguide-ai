import { Volume2, VolumeX, User } from "lucide-react";
import { AvatarRenderer } from "../avatar/AvatarRenderer";

interface ChatMessageProps {
  role: "user" | "assistant";
  text: string;
  isPlaying?: boolean;
  onToggleAudio?: () => void;
}

export function ChatMessage({ role, text, isPlaying, onToggleAudio }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-slide-up items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy/5">
        {isUser ? <User className="h-4 w-4 text-navy/50" /> : <AvatarRenderer state="explaining" className="h-full w-full" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
          isUser ? "rounded-br-sm bg-navy text-white" : "rounded-bl-sm bg-white text-text-dark"
        }`}
      >
        <div className="flex items-start gap-2">
          <p>{text}</p>
          {!isUser && onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={isPlaying ? "Stop reading answer aloud" : "Read answer aloud"}
              className="mt-0.5 shrink-0 text-gold-dark hover:text-gold"
            >
              {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
